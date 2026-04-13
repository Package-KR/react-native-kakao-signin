export type KakaoOAuthToken = {
  accessToken: string;
  refreshToken: string;
  idToken: string | null;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  scopes: string[] | null;
};

export type KakaoAccessTokenInfo = {
  accessToken: string;
  expiresIn: string;
};

export type KakaoShippingAddress = {
  id: string;
  name: string;
  isDefault: boolean;
  updatedAt: string;
  type: string;
  baseAddress: string;
  detailAddress: string;
  receiverName: string;
  receiverPhoneNumber1: string;
  receiverPhoneNumber2: string;
  zoneNumber: string;
  zipCode: string;
};

export type KakaoShippingAddresses = {
  userId: string;
  needsAgreement: boolean;
  shippingAddresses: KakaoShippingAddress[];
};

export type KakaoServiceTerm = {
  tag: string;
  agreed: boolean;
  required: boolean;
  revocable: boolean;
  agreedAt?: string;
};

export type KakaoServiceTerms = {
  userId: string;
  serviceTerms: KakaoServiceTerm[];
};

export type KakaoProfile = {
  id: number | null;
  nickname: string | null;
  name: string | null;
  email: string | null;
  profileImageUrl: string | null;
  thumbnailImageUrl: string | null;
  gender: string | null;
  ageRange: string | null;
  birthday: string | null;
  birthdayType: string | null;
  birthyear: string | null;
  phoneNumber: string | null;
  isEmailValid: boolean | null;
  isEmailVerified: boolean | null;
  isKorean: boolean | null;
  isDefaultImage: boolean | null;
  connectedAt: string | null;
  synchedAt: string | null;
  ci: string | null;
  ciAuthenticatedAt: string | null;
  emailNeedsAgreement: boolean | null;
  profileNeedsAgreement: boolean | null;
  phoneNumberNeedsAgreement: boolean | null;
  genderNeedsAgreement: boolean | null;
  ageRangeNeedsAgreement: boolean | null;
  birthdayNeedsAgreement: boolean | null;
  birthyearNeedsAgreement: boolean | null;
  isKoreanNeedsAgreement: boolean | null;
  profileNicknameNeedsAgreement: boolean | null;
  profileImageNeedsAgreement: boolean | null;
  nameNeedsAgreement: boolean | null;
  ciNeedsAgreement: boolean | null;
};
