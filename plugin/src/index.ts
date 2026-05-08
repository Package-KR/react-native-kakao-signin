import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

import { withAndroidKakaoSignin } from "./android/withAndroidKakaoSignin";
import { withIosKakaoSignin } from "./ios/withIosKakaoSignin";

export interface KakaoSigninPluginProps {
  kakaoAppKey: string;
  kakaoAppScheme?: string;
  overrideKakaoSDKVersion?: string;
}

const normalizePluginProps = (
  props?: KakaoSigninPluginProps
): KakaoSigninPluginProps => {
  const kakaoAppKey =
    typeof props?.kakaoAppKey === "string" ? props.kakaoAppKey.trim() : "";

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

  const kakaoAppScheme =
    typeof props?.kakaoAppScheme === "string"
      ? props.kakaoAppScheme.trim()
      : undefined;

  if (kakaoAppScheme !== undefined && !/^[A-Za-z][A-Za-z0-9+.-]*$/.test(kakaoAppScheme)) {
    throw new Error(
      "[@package-kr/react-native-kakao-signin] kakaoAppScheme must be a URL scheme value without ://"
    );
  }

  const overrideKakaoSDKVersion =
    typeof props?.overrideKakaoSDKVersion === "string"
      ? props.overrideKakaoSDKVersion.trim()
      : undefined;

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

const withKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  const normalizedProps = normalizePluginProps(props);

  config = withIosKakaoSignin(config, normalizedProps);
  config = withAndroidKakaoSignin(config, normalizedProps);

  return config;
};

const pak = require("../../package.json");
export default createRunOncePlugin(withKakaoSignin, pak.name, pak.version);
