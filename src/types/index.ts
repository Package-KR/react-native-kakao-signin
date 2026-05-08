// 에러 코드
export const KAKAO_ERROR_CODES = [
  'KAKAO_ACTIVITY_DOES_NOT_EXIST',
  'KAKAO_ACCESS_DENIED',
  'KAKAO_API_ERROR',
  'KAKAO_AUTH_ERROR',
  'KAKAO_BAD_PARAMETER',
  'KAKAO_CANCELLED',
  'KAKAO_CLIENT_ERROR',
  'KAKAO_ERROR',
  'KAKAO_FORBIDDEN',
  'KAKAO_ILLEGAL_STATE',
  'KAKAO_INVALID_APP_KEY',
  'KAKAO_INVALID_BUNDLE_ID',
  'KAKAO_INVALID_CLIENT',
  'KAKAO_INVALID_GRANT',
  'KAKAO_INVALID_REQUEST',
  'KAKAO_INVALID_SCOPE',
  'KAKAO_INVALID_URL_SCHEME',
  'KAKAO_LOGIN_REQUIRED',
  'KAKAO_MISCONFIGURED',
  'KAKAO_NOT_SUPPORTED',
  'KAKAO_PROFILE_NOT_FOUND',
  'KAKAO_RATE_LIMIT',
  'KAKAO_SERVER_ERROR',
  'KAKAO_SHIPPING_ADDRESSES_NOT_FOUND',
  'KAKAO_TOKEN_EXPIRED',
  'KAKAO_TOKEN_NOT_FOUND',
  'KAKAO_UNKNOWN_ERROR',
] as const;

export type KakaoErrorCode = (typeof KAKAO_ERROR_CODES)[number];

// 에러 타입
export type KakaoSigninError = Error & {
  code: KakaoErrorCode;
  sdkMessage?: string;
  userInfo?: {
    sdkMessage?: string;
  };
};

export type KakaoOAuthToken = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  idToken?: string;
  refreshTokenExpiresAt?: string;
  scopes?: string[];
};

export type KakaoAccessTokenInfo = {
  accessToken: string;
  expiresIn?: number;
};

export const KAKAO_BIRTHDAY_TYPES = ['solar', 'lunar', 'unknown'] as const;
export const KAKAO_SHIPPING_ADDRESS_TYPES = ['old', 'new', 'unknown'] as const;

export type KakaoBirthdayType = (typeof KAKAO_BIRTHDAY_TYPES)[number];
export type KakaoShippingAddressType = (typeof KAKAO_SHIPPING_ADDRESS_TYPES)[number];

export type KakaoShippingAddress = {
  baseAddress?: string;
  detailAddress?: string;
  id?: string;
  isDefault?: boolean;
  name?: string;
  receiverName?: string;
  receiverPhoneNumber1?: string;
  receiverPhoneNumber2?: string;
  type?: KakaoShippingAddressType;
  updatedAt?: string;
  zipCode?: string;
  zoneNumber?: string;
};

export type KakaoShippingAddresses = {
  needsAgreement?: boolean;
  shippingAddresses: KakaoShippingAddress[];
  userId?: string;
};

export type KakaoServiceTerm = {
  tag: string;
  agreed: boolean;
  required: boolean;
  revocable: boolean;
  agreedAt?: string;
};

export type KakaoServiceTerms = {
  serviceTerms: KakaoServiceTerm[];
  userId?: string;
};

export type KakaoProfile = {
  ageRange?: string;
  ageRangeNeedsAgreement?: boolean;
  birthday?: string;
  birthdayNeedsAgreement?: boolean;
  birthdayType?: KakaoBirthdayType;
  birthyear?: string;
  birthyearNeedsAgreement?: boolean;
  ci?: string;
  ciAuthenticatedAt?: string;
  ciNeedsAgreement?: boolean;
  connectedAt?: string;
  email?: string;
  emailNeedsAgreement?: boolean;
  gender?: string;
  genderNeedsAgreement?: boolean;
  id?: string;
  isDefaultImage?: boolean;
  isEmailValid?: boolean;
  isEmailVerified?: boolean;
  isKorean?: boolean;
  isKoreanNeedsAgreement?: boolean;
  isLeapMonth?: boolean;
  legalBirthDate?: string;
  legalBirthDateNeedsAgreement?: boolean;
  legalGender?: string;
  legalGenderNeedsAgreement?: boolean;
  legalName?: string;
  legalNameNeedsAgreement?: boolean;
  name?: string;
  nameNeedsAgreement?: boolean;
  nickname?: string;
  phoneNumber?: string;
  phoneNumberNeedsAgreement?: boolean;
  profileImageNeedsAgreement?: boolean;
  profileImageUrl?: string;
  profileNeedsAgreement?: boolean;
  profileNicknameNeedsAgreement?: boolean;
  synchedAt?: string;
  thumbnailImageUrl?: string;
};
