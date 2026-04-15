import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

import { withAndroidKakaoSignin } from "./android/withAndroidKakaoSignin";
import { withIosKakaoSignin } from "./ios/withIosKakaoSignin";

export interface KakaoSigninPluginProps {
  kakaoAppKey: string;
  overrideKakaoSDKVersion?: string;
}

const withKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (
  config,
  props
) => {
  if (!props?.kakaoAppKey) {
    throw new Error(
      "[@package-kr/react-native-kakao-signin] kakaoAppKey is required"
    );
  }

  config = withIosKakaoSignin(config, props);
  config = withAndroidKakaoSignin(config, props);

  return config;
};

const pak = require("../../package.json");
export default createRunOncePlugin(withKakaoSignin, pak.name, pak.version);
