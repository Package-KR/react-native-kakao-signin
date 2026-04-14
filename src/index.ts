import NativeKakaoLogin from './NativeRNKakaoSignin';

import type {
  KakaoOAuthToken,
  KakaoProfile,
  KakaoAccessTokenInfo,
  KakaoShippingAddresses,
  KakaoServiceTerms,
} from './types';

// 카카오 로그인
export const login = (): Promise<KakaoOAuthToken> => {
  return NativeKakaoLogin.login() as unknown as Promise<KakaoOAuthToken>;
};

// 카카오계정으로 로그인
export const loginWithKakaoAccount = (): Promise<KakaoOAuthToken> => {
  return NativeKakaoLogin.loginWithKakaoAccount() as unknown as Promise<KakaoOAuthToken>;
};

// 로그아웃
export const logout = (): Promise<string> => {
  return NativeKakaoLogin.logout();
};

// 연결 끊기
export const unlink = (): Promise<string> => {
  return NativeKakaoLogin.unlink();
};

// 프로필 조회
export const getProfile = (): Promise<KakaoProfile> => {
  return NativeKakaoLogin.getProfile() as unknown as Promise<KakaoProfile>;
};

// 토큰 정보 조회
export const getAccessToken = (): Promise<KakaoAccessTokenInfo> => {
  return NativeKakaoLogin.getAccessToken() as unknown as Promise<KakaoAccessTokenInfo>;
};

// 배송지 조회
export const shippingAddresses = (): Promise<KakaoShippingAddresses> => {
  return NativeKakaoLogin.shippingAddresses() as unknown as Promise<KakaoShippingAddresses>;
};

// 서비스 약관 조회
export const serviceTerms = (): Promise<KakaoServiceTerms> => {
  return NativeKakaoLogin.serviceTerms() as unknown as Promise<KakaoServiceTerms>;
};

export * from './types';
