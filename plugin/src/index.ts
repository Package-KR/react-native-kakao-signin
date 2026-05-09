import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

import { withAndroidKakaoSignin } from "./android/withAndroidKakaoSignin";
import { withIosKakaoSignin } from "./ios/withIosKakaoSignin";

export interface KakaoSigninPluginProps {
  kakaoAppKey: string;
  kakaoAppScheme?: string;
  overrideKakaoSDKVersion?: string;
}

// 문자열 입력값 정규화
const trimString = (value: unknown): string | undefined =>
  typeof value === "string" ? value.trim() : undefined;

// 플러그인 입력값 검증
const normalizePluginProps = (
  props?: KakaoSigninPluginProps
): KakaoSigninPluginProps => {
  const kakaoAppKey = trimString(props?.kakaoAppKey) ?? "";

  if (!kakaoAppKey) {
    throw new Error(
      "[@package-kr/react-native-kakao-signin] kakaoAppKey is required"
    );
  }

  if (/^kakao/i.test(kakaoAppKey)) {
    throw new Error(
      "[@package-kr/react-native-kakao-signin] kakaoAppKey must be the raw Kakao native app key without the kakao prefix"
    );
  }

  const kakaoAppScheme = trimString(props?.kakaoAppScheme);

  if (kakaoAppScheme !== undefined && !/^[A-Za-z][A-Za-z0-9+.-]*$/.test(kakaoAppScheme)) {
    throw new Error(
      "[@package-kr/react-native-kakao-signin] kakaoAppScheme must be a URL scheme value without ://"
    );
  }

  const overrideKakaoSDKVersion = trimString(props?.overrideKakaoSDKVersion);

  if (
    overrideKakaoSDKVersion !== undefined &&
    !/^[0-9A-Za-z][0-9A-Za-z.+_-]*$/.test(overrideKakaoSDKVersion)
  ) {
    throw new Error(
      "[@package-kr/react-native-kakao-signin] overrideKakaoSDKVersion must be a single SDK version string"
    );
  }

  return {
    ...props,
    kakaoAppKey,
    kakaoAppScheme,
    overrideKakaoSDKVersion,
  };
};

// iOS/Android 설정 적용
const withKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  const normalizedProps = normalizePluginProps(props);

  return withAndroidKakaoSignin(
    withIosKakaoSignin(config, normalizedProps),
    normalizedProps
  );
};

const pak = require("../../package.json");
export default createRunOncePlugin(withKakaoSignin, pak.name, pak.version);
