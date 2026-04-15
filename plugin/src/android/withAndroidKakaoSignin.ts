import {
  AndroidConfig,
  type ConfigPlugin,
  withAndroidManifest,
  withStringsXml,
  withProjectBuildGradle,
} from "@expo/config-plugins";
import type { ManifestActivity } from "@expo/config-plugins/build/android/Manifest";
import type { KakaoSigninPluginProps } from "..";

const ACTIVITY_NAME = "com.kakao.sdk.auth.AuthCodeHandlerActivity";

/**
 * AndroidManifest.xml에 AuthCodeHandlerActivity 추가
 * 카카오톡 로그인 후 앱으로 돌아오기 위한 리다이렉트 설정
 */
const modifyAndroidManifest: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    const kakaoActivity: ManifestActivity = {
      $: {
        "android:name": ACTIVITY_NAME,
        "android:exported": "true",
      },
      "intent-filter": [
        {
          action: [
            {
              $: { "android:name": "android.intent.action.VIEW" },
            },
          ],
          category: [
            { $: { "android:name": "android.intent.category.DEFAULT" } },
            { $: { "android:name": "android.intent.category.BROWSABLE" } },
          ],
          data: [
            {
              $: {
                "android:host": "oauth",
                "android:scheme": `kakao${props.kakaoAppKey}`,
              },
            },
          ],
        },
      ],
    };

    if (!mainApplication.activity) {
      mainApplication.activity = [];
    }

    // 기존 카카오 액티비티가 있으면 교체, 없으면 추가
    const existingIndex = mainApplication.activity.findIndex(
      (activity) => activity.$["android:name"] === ACTIVITY_NAME
    );

    if (existingIndex < 0) {
      mainApplication.activity.push(kakaoActivity);
    } else {
      mainApplication.activity.splice(existingIndex, 1, kakaoActivity);
    }

    return config;
  });
};

/**
 * strings.xml에 kakao_app_key 추가
 */
const modifyStringsXml: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  return withStringsXml(config, (config) => {
    AndroidConfig.Strings.setStringItem(
      [{ $: { name: "kakao_app_key" }, _: props.kakaoAppKey }],
      config.modResults
    );

    return config;
  });
};

/**
 * build.gradle에 kakaoSdkVersion ext 속성 주입
 * overrideKakaoSDKVersion이 지정된 경우에만 동작
 */
const modifyProjectBuildGradle: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  if (!props.overrideKakaoSDKVersion) return config;

  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    const extProperty = `kakaoSdkVersion = "${props.overrideKakaoSDKVersion}"`;

    // 이미 kakaoSdkVersion이 선언되어 있으면 교체
    if (contents.includes("kakaoSdkVersion")) {
      config.modResults.contents = contents.replace(
        /kakaoSdkVersion\s*=\s*"[^"]*"/,
        extProperty
      );
      return config;
    }

    // ext 블록이 있으면 그 안에 추가
    if (contents.includes("ext {")) {
      config.modResults.contents = contents.replace(
        /ext\s*{/,
        `ext {\n        ${extProperty}`
      );
    } else {
      // ext 블록이 없으면 새로 생성
      config.modResults.contents = contents.replace(
        /buildscript\s*{/,
        `buildscript {\n    ext {\n        ${extProperty}\n    }`
      );
    }

    return config;
  });
};

export const withAndroidKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  config = modifyAndroidManifest(config, props);
  config = modifyStringsXml(config, props);
  config = modifyProjectBuildGradle(config, props);

  return config;
};
