import { type ConfigPlugin, withInfoPlist, withAppDelegate, withDangerousMod } from '@expo/config-plugins';
import { readFile, writeFile } from 'node:fs/promises';
import type { KakaoSigninPluginProps } from '..';

const KAKAO_SCHEMES = ['kakaokompassauth', 'kakaotalk'];
const KAKAO_OPEN_URL_MARKER_START = '// @package-kr/react-native-kakao-signin open-url start';
const KAKAO_OPEN_URL_MARKER_END = '// @package-kr/react-native-kakao-signin open-url end';
const KAKAO_OPEN_URL_BLOCK_REGEX =
  /\n?[ \t]*\/\/ @package-kr\/react-native-kakao-signin open-url start[\s\S]*?\/\/ @package-kr\/react-native-kakao-signin open-url end\r?\n?/m;

const addSwiftImport = (contents: string, moduleName: string): string => {
  if (new RegExp(`^\\s*import\\s+${moduleName}\\s*$`, 'm').test(contents)) {
    return contents;
  }

  const nextContents = contents.replace(/(import .+\n)(?!import )/, `$1import ${moduleName}\n`);

  if (nextContents === contents) {
    throw new Error(`[@package-kr/react-native-kakao-signin] Unable to add ${moduleName} import to AppDelegate.swift`);
  }

  return nextContents;
};

const openUrlMethodRegex =
  /(^[ \t]*(?:(?:public|internal|private|fileprivate|open|override)\s+)*func\s+application\s*\(\s*_\s+\w+\s*:\s*UIApplication\s*,\s*open\s+url\s*:\s*URL\s*,\s*options\s*:\s*\[UIApplication\.OpenURLOptionsKey\s*:\s*Any\](?:\s*=\s*\[:\])?\s*\)\s*->\s*Bool\s*\{)/m;

const createKakaoOpenUrlBlock = (indent: string): string =>
  [
    `${indent}${KAKAO_OPEN_URL_MARKER_START}`,
    `${indent}if RNKakaoSignin.handleOpen(url) {`,
    `${indent}  return true`,
    `${indent}}`,
    `${indent}${KAKAO_OPEN_URL_MARKER_END}`,
  ].join('\n');

const removeKakaoOpenUrlBlock = (contents: string): string =>
  contents
    .replace(KAKAO_OPEN_URL_BLOCK_REGEX, '\n')
    .replace(
      /\n?[ \t]*\/\/ @package-kr\/react-native-kakao-signin open-url\r?\n[ \t]*return RNKakaoSignin\.handleOpen(?:Url)?\(url\)\s*\|\|\s*\((.*?)\)/m,
      '\n    return $1',
    )
    .replace(
      /\n?[ \t]*\/\/ @package-kr\/react-native-kakao-signin open-url\r?\n[ \t]*return RNKakaoSignin\.handleOpen(?:Url)?\(url\)\r?\n?/m,
      '\n',
    );

const injectKakaoOpenUrlHandler = (contents: string): string => {
  const cleanedContents = removeKakaoOpenUrlBlock(contents);
  const existingMethod = openUrlMethodRegex.exec(cleanedContents);

  if (existingMethod) {
    return cleanedContents.replace(openUrlMethodRegex, `$1\n${createKakaoOpenUrlBlock('    ')}`);
  }

  if (!/\bclass\s+AppDelegate\b/.test(cleanedContents)) {
    throw new Error(
      '[@package-kr/react-native-kakao-signin] Unable to find AppDelegate class in AppDelegate.swift. Add application(_:open:options:) manually or use a supported Expo AppDelegate template.',
    );
  }

  const handler = createKakaoOpenUrlBlock('    ');
  const openUrlMethod = `  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
${handler}
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }`;

  return cleanedContents.replace(/\n}\s*$/, `\n\n${openUrlMethod}\n}\n`);
};

const modifyInfoPlist: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  return withInfoPlist(config, config => {
    const kakaoScheme = props.kakaoAppScheme ?? `kakao${props.kakaoAppKey}`;

    config.modResults.KAKAO_APP_KEY = props.kakaoAppKey;
    config.modResults.KAKAO_APP_SCHEME = kakaoScheme;

    if (!Array.isArray(config.modResults.CFBundleURLTypes)) {
      config.modResults.CFBundleURLTypes = [];
    }

    const primaryUrlType = config.modResults.CFBundleURLTypes.find(item => item.CFBundleURLName === 'KAKAO');

    if (primaryUrlType) {
      const schemes = new Set(
        Array.isArray(primaryUrlType.CFBundleURLSchemes) ? primaryUrlType.CFBundleURLSchemes : [],
      );
      schemes.add(kakaoScheme);

      primaryUrlType.CFBundleURLSchemes = Array.from(schemes);
    } else {
      config.modResults.CFBundleURLTypes.push({
        CFBundleURLName: 'KAKAO',
        CFBundleURLSchemes: [kakaoScheme],
      });
    }

    if (!Array.isArray(config.modResults.LSApplicationQueriesSchemes)) {
      config.modResults.LSApplicationQueriesSchemes = [];
    }

    const allSchemes = [kakaoScheme, ...KAKAO_SCHEMES];
    allSchemes.forEach(scheme => {
      if (!config.modResults.LSApplicationQueriesSchemes?.includes(scheme)) {
        config.modResults.LSApplicationQueriesSchemes?.push(scheme);
      }
    });

    return config;
  });
};

const modifyAppDelegate: ConfigPlugin<KakaoSigninPluginProps> = (config, _props) => {
  return withAppDelegate(config, config => {
    config.modResults.contents = addSwiftImport(config.modResults.contents, 'React');
    config.modResults.contents = addSwiftImport(config.modResults.contents, 'RNKakaoSignin');

    config.modResults.contents = injectKakaoOpenUrlHandler(config.modResults.contents);

    return config;
  });
};

const KAKAO_SDK_VERSION_VARIABLE = '$KakaoSDKVersion';
const KAKAO_SDK_VERSION_MARKER_START = '# @package-kr/react-native-kakao-signin KakaoSDKVersion start';
const KAKAO_SDK_VERSION_MARKER_END = '# @package-kr/react-native-kakao-signin KakaoSDKVersion end';
const KAKAO_SDK_VERSION_REGEX =
  /\s*# @package-kr\/react-native-kakao-signin KakaoSDKVersion start\r?\n\s*\$KakaoSDKVersion\s*=\s*["'][^"']*["']\r?\n\s*# @package-kr\/react-native-kakao-signin KakaoSDKVersion end\r?\n?/m;

const modifyPodfile: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const iosPath = config.modRequest.platformProjectRoot;
      const podfile = await readFile(`${iosPath}/Podfile`, 'utf8');

      const cleanedPodfile = podfile.replace(KAKAO_SDK_VERSION_REGEX, '');

      if (!props.overrideKakaoSDKVersion) {
        if (cleanedPodfile !== podfile) {
          await writeFile(`${iosPath}/Podfile`, cleanedPodfile);
        }

        return config;
      }

      const declaration = [
        KAKAO_SDK_VERSION_MARKER_START,
        `${KAKAO_SDK_VERSION_VARIABLE}="${props.overrideKakaoSDKVersion}"`,
        KAKAO_SDK_VERSION_MARKER_END,
      ].join('\n');
      const targetRegex = /^target\s+["'][^"']+["']\s+do\s*$/m;
      const newPodfile = targetRegex.test(cleanedPodfile)
        ? cleanedPodfile.replace(targetRegex, `${declaration}\n$&`)
        : `${declaration}\n${cleanedPodfile}`;

      if (newPodfile !== podfile) {
        await writeFile(`${iosPath}/Podfile`, newPodfile);
      }

      return config;
    },
  ]);
};

export const withIosKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  config = modifyInfoPlist(config, props);
  config = modifyAppDelegate(config, props);
  config = modifyPodfile(config, props);

  return config;
};
