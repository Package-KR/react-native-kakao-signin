import {
  type ConfigPlugin,
  withInfoPlist,
  withAppDelegate,
} from "@expo/config-plugins";
import { insertContentsInsideSwiftFunctionBlock } from "@expo/config-plugins/build/ios/codeMod";
import type { KakaoSigninPluginProps } from "..";

const KAKAO_SCHEMES = ["kakaokompassauth", "kakaotalk"];

// ObjC
const OBJC_IMPORT = "#import <RNKakaoSignins.h>";
const OBJC_LINKING = `if([RNKakaoSignins isKakaoTalkLoginUrl:url]) {
  return [RNKakaoSignins handleOpenUrl: url];
}`;

// Swift
const SWIFT_IMPORT = "import kakao_login";
const SWIFT_LINKING =
  "if kakao_login.RNKakaoSignins.isKakaoTalkLoginUrl(url) { return kakao_login.RNKakaoSignins.handleOpen(url) }";

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
 * AppDelegate에 카카오 URL 핸들링 코드 주입
 */
const modifyAppDelegate: ConfigPlugin = (config) => {
  return withAppDelegate(config, (config) => {
    const { contents, language } = config.modResults;

    if (["objc", "objcpp"].includes(language)) {
      let modified = contents;

      // import 추가
      if (!modified.includes(OBJC_IMPORT)) {
        modified = modified.replace(
          "#import <React/RCTLinkingManager.h>",
          `#import <React/RCTLinkingManager.h>\n${OBJC_IMPORT}`
        );
      }

      // URL 핸들링 추가
      if (!modified.includes(OBJC_LINKING)) {
        modified = modified.replace(
          "options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {",
          `options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\n  ${OBJC_LINKING}`
        );
      }

      config.modResults.contents = modified;
    } else {
      let modified = contents;

      // Swift import 추가
      if (!modified.includes(SWIFT_IMPORT)) {
        modified = modified.replace(
          "import Expo",
          `import Expo\n${SWIFT_IMPORT}`
        );
      }

      // Swift URL 핸들링 추가
      if (!modified.includes(SWIFT_LINKING)) {
        modified = insertContentsInsideSwiftFunctionBlock(
          modified,
          "application(_:open:options:)",
          SWIFT_LINKING,
          { position: "head" }
        );
      }

      config.modResults.contents = modified;
    }

    return config;
  });
};

export const withIosKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  config = modifyInfoPlist(config, props);
  config = modifyAppDelegate(config);

  return config;
};
