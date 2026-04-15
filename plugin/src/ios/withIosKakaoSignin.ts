import {
  type ConfigPlugin,
  withInfoPlist,
  withAppDelegate,
  withXcodeProject,
} from "@expo/config-plugins";
import { readFile, writeFile } from "node:fs";
import type { KakaoSigninPluginProps } from "..";

const KAKAO_SCHEMES = ["kakaokompassauth", "kakaotalk"];

/**
 * Info.plist에 카카오 URL Scheme, KAKAO_APP_KEY, LSApplicationQueriesSchemes 추가
 */
const modifyInfoPlist: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  return withInfoPlist(config, (config) => {
    const kakaoScheme = `kakao${props.kakaoAppKey}`;

    // KAKAO_APP_KEY
    config.modResults.KAKAO_APP_KEY = props.kakaoAppKey;

    // CFBundleURLTypes - kakao{앱키} scheme 등록
    if (!Array.isArray(config.modResults.CFBundleURLTypes)) {
      config.modResults.CFBundleURLTypes = [];
    }

    const hasKakaoScheme = config.modResults.CFBundleURLTypes.some((item) =>
      item.CFBundleURLSchemes?.includes(kakaoScheme)
    );

    if (!hasKakaoScheme) {
      config.modResults.CFBundleURLTypes.push({
        CFBundleURLSchemes: [kakaoScheme],
      });
    }

    // LSApplicationQueriesSchemes - 카카오톡 앱 탐지용
    if (!Array.isArray(config.modResults.LSApplicationQueriesSchemes)) {
      config.modResults.LSApplicationQueriesSchemes = [];
    }

    const allSchemes = [kakaoScheme, ...KAKAO_SCHEMES];
    allSchemes.forEach((scheme) => {
      if (!config.modResults.LSApplicationQueriesSchemes?.includes(scheme)) {
        config.modResults.LSApplicationQueriesSchemes?.push(scheme);
      }
    });

    return config;
  });
};

/**
 * AppDelegate에 카카오 로그인 URL 처리 코드 주입
 */
const modifyAppDelegate: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  _props
) => {
  return withAppDelegate(config, (config) => {
    const contents = config.modResults.contents;

    // import 추가
    if (!contents.includes("import KakaoSDKAuth")) {
      config.modResults.contents = config.modResults.contents.replace(
        /import Expo\n/,
        "import Expo\nimport KakaoSDKAuth\n"
      );
    }

    // openURL 메서드에 카카오 URL 처리 추가
    if (!contents.includes("AuthApi.isKakaoTalkLoginUrl")) {
      config.modResults.contents = config.modResults.contents.replace(
        /(open url: URL,\n\s*options: \[UIApplication\.OpenURLOptionsKey: Any\] = \[:\]\n\s*\) -> Bool \{)\n\s*(return )/,
        `$1\n    if AuthApi.isKakaoTalkLoginUrl(url) {\n      return AuthController.handleOpenUrl(url: url)\n    }\n    $2`
      );
    }

    return config;
  });
};

const KAKAO_SDK_VERSION_VARIABLE = "$KakaoSDKVersion";
const KAKAO_SDK_VERSION_REGEX = /\$KakaoSDKVersion\=.*(\r\n|\r|\n)/g;

const readFileAsync = (path: string): Promise<string> =>
  new Promise((resolve, reject) =>
    readFile(path, "utf8", (err, data) => (err ? reject(err) : resolve(data)))
  );

const writeFileAsync = (path: string, data: string): Promise<void> =>
  new Promise((resolve, reject) =>
    writeFile(path, data, (err) => (err ? reject(err) : resolve()))
  );

/**
 * Podfile에 $KakaoSDKVersion 변수 주입
 * overrideKakaoSDKVersion이 지정된 경우에만 동작
 */
const modifyPodfile: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  return withXcodeProject(config, async (config) => {
    const iosPath = config.modRequest.platformProjectRoot;
    const podfile = await readFileAsync(`${iosPath}/Podfile`);

    // 기존 $KakaoSDKVersion 선언 제거
    const cleanedPodfile = podfile.replace(KAKAO_SDK_VERSION_REGEX, "");

    if (props.overrideKakaoSDKVersion) {
      const newPodfile = cleanedPodfile.concat(
        `${KAKAO_SDK_VERSION_VARIABLE}="${props.overrideKakaoSDKVersion}"\n`
      );
      await writeFileAsync(`${iosPath}/Podfile`, newPodfile);
    } else {
      await writeFileAsync(`${iosPath}/Podfile`, cleanedPodfile);
    }

    return config;
  });
};

export const withIosKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  config = modifyInfoPlist(config, props);
  config = modifyAppDelegate(config, props);
  config = modifyPodfile(config, props);

  return config;
};
