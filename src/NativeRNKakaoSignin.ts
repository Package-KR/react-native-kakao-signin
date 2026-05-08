import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type NativeKakaoOAuthToken = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  idToken?: string;
  refreshTokenExpiresAt?: string;
  scopes?: string[];
};

export type NativeKakaoAccessTokenInfo = {
  accessToken: string;
  expiresIn?: number;
};

export type NativeKakaoProfile = {
  ageRange?: string;
  ageRangeNeedsAgreement?: boolean;
  birthday?: string;
  birthdayNeedsAgreement?: boolean;
  birthdayType?: string;
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

export type NativeKakaoShippingAddress = {
  baseAddress?: string;
  detailAddress?: string;
  id?: string;
  isDefault?: boolean;
  name?: string;
  receiverName?: string;
  receiverPhoneNumber1?: string;
  receiverPhoneNumber2?: string;
  type?: string;
  updatedAt?: string;
  zipCode?: string;
  zoneNumber?: string;
};

export type NativeKakaoShippingAddresses = {
  needsAgreement?: boolean;
  shippingAddresses: NativeKakaoShippingAddress[];
  userId?: string;
};

export type NativeKakaoServiceTerm = {
  tag: string;
  agreed: boolean;
  required: boolean;
  revocable: boolean;
  agreedAt?: string;
};

export type NativeKakaoServiceTerms = {
  serviceTerms: NativeKakaoServiceTerm[];
  userId?: string;
};

export interface Spec extends TurboModule {
  login(): Promise<NativeKakaoOAuthToken>;
  loginWithKakaoAccount(): Promise<NativeKakaoOAuthToken>;
  logout(): Promise<boolean>;
  unlink(): Promise<boolean>;
  getProfile(): Promise<NativeKakaoProfile>;
  getAccessToken(): Promise<NativeKakaoAccessTokenInfo | null>;
  shippingAddresses(): Promise<NativeKakaoShippingAddresses>;
  serviceTerms(): Promise<NativeKakaoServiceTerms>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNKakaoSignin');
