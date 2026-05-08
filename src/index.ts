import NativeKakaoSignin from './NativeRNKakaoSignin';
import type { NativeKakaoProfile, NativeKakaoShippingAddresses } from './NativeRNKakaoSignin';

import {
  KAKAO_ERROR_CODES,
  KAKAO_BIRTHDAY_TYPES,
  KAKAO_SHIPPING_ADDRESS_TYPES,
  type KakaoBirthdayType,
  type KakaoErrorCode,
  type KakaoOAuthToken,
  type KakaoProfile,
  type KakaoAccessTokenInfo,
  type KakaoShippingAddressType,
  type KakaoShippingAddresses,
  type KakaoServiceTerms,
  type KakaoSigninError,
} from './types';

const KAKAO_ERROR_CODE_SET: ReadonlySet<KakaoErrorCode> = new Set(KAKAO_ERROR_CODES);
const KAKAO_BIRTHDAY_TYPE_SET: ReadonlySet<KakaoBirthdayType> = new Set(KAKAO_BIRTHDAY_TYPES);
const KAKAO_SHIPPING_ADDRESS_TYPE_SET: ReadonlySet<KakaoShippingAddressType> = new Set(KAKAO_SHIPPING_ADDRESS_TYPES);

const normalizeBirthdayType = (value: string | undefined): KakaoBirthdayType | undefined => {
  return KAKAO_BIRTHDAY_TYPE_SET.has(value as KakaoBirthdayType) ? (value as KakaoBirthdayType) : undefined;
};

const normalizeShippingAddressType = (value: string | undefined): KakaoShippingAddressType | undefined => {
  return KAKAO_SHIPPING_ADDRESS_TYPE_SET.has(value as KakaoShippingAddressType)
    ? (value as KakaoShippingAddressType)
    : undefined;
};

const normalizeProfile = (profile: NativeKakaoProfile): KakaoProfile => ({
  ...profile,
  birthdayType: normalizeBirthdayType(profile.birthdayType),
});

const normalizeShippingAddresses = (addresses: NativeKakaoShippingAddresses): KakaoShippingAddresses => ({
  ...addresses,
  shippingAddresses: addresses.shippingAddresses.map(address => ({
    ...address,
    type: normalizeShippingAddressType(address.type),
  })),
});

// 카카오 로그인
export const login = (): Promise<KakaoOAuthToken> => {
  return NativeKakaoSignin.login();
};

// 카카오계정으로 로그인
export const loginWithKakaoAccount = (): Promise<KakaoOAuthToken> => {
  return NativeKakaoSignin.loginWithKakaoAccount();
};

// 로그아웃
export const logout = (): Promise<boolean> => {
  return NativeKakaoSignin.logout();
};

// 연결 끊기
export const unlink = (): Promise<boolean> => {
  return NativeKakaoSignin.unlink();
};

// 프로필 조회
export const getProfile = (): Promise<KakaoProfile> => {
  return NativeKakaoSignin.getProfile().then(normalizeProfile);
};

// 토큰 정보 조회
export const getAccessToken = (): Promise<KakaoAccessTokenInfo | null> => {
  return NativeKakaoSignin.getAccessToken();
};

// 배송지 조회
export const shippingAddresses = (): Promise<KakaoShippingAddresses> => {
  return NativeKakaoSignin.shippingAddresses().then(normalizeShippingAddresses);
};

// 서비스 약관 조회
export const serviceTerms = (): Promise<KakaoServiceTerms> => {
  return NativeKakaoSignin.serviceTerms();
};

// 카카오 에러 type guard
export const isKakaoSigninError = (error: unknown): error is KakaoSigninError => {
  if (typeof error !== 'object' || error == null) {
    return false;
  }

  const { code, message } = error as { code?: unknown; message?: unknown };
  return typeof message === 'string' && typeof code === 'string' && KAKAO_ERROR_CODE_SET.has(code as KakaoErrorCode);
};

export * from './types';
