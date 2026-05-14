import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getProfile,
  isKakaoSigninError,
  login,
  logout,
} from '@package-kr/react-native-kakao-signin';
import type {
  KakaoOAuthToken,
  KakaoProfile,
} from '@package-kr/react-native-kakao-signin';

import { styles } from './login.styles';

const TOKEN_KEY_ORDER = [
  'accessToken',
  'refreshToken',
  'idToken',
  'accessTokenExpiresAt',
  'refreshTokenExpiresAt',
  'scopes',
] as const satisfies readonly (keyof KakaoOAuthToken)[];

const PROFILE_KEY_ORDER = [
  'id',
  'nickname',
  'name',
  'email',
  'profileImageUrl',
  'thumbnailImageUrl',
  'gender',
  'ageRange',
  'birthday',
  'birthdayType',
  'birthyear',
  'phoneNumber',
  'isEmailValid',
  'isEmailVerified',
  'isKorean',
  'isDefaultImage',
  'isLeapMonth',
  'connectedAt',
  'synchedAt',
  'ci',
  'ciAuthenticatedAt',
  'legalName',
  'legalBirthDate',
  'legalGender',
  'emailNeedsAgreement',
  'profileNeedsAgreement',
  'phoneNumberNeedsAgreement',
  'genderNeedsAgreement',
  'ageRangeNeedsAgreement',
  'birthdayNeedsAgreement',
  'birthyearNeedsAgreement',
  'isKoreanNeedsAgreement',
  'profileNicknameNeedsAgreement',
  'profileImageNeedsAgreement',
  'nameNeedsAgreement',
  'ciNeedsAgreement',
  'legalNameNeedsAgreement',
  'legalBirthDateNeedsAgreement',
  'legalGenderNeedsAgreement',
] as const satisfies readonly (keyof KakaoProfile)[];

const RESPONSE_LABELS = {
  token: '토큰',
  profile: '프로필',
  error: '오류',
} as const;

type ResponseType = keyof typeof RESPONSE_LABELS;

function sortedStringify(data: unknown, keyOrder: readonly string[] = []): string {
  if (typeof data !== 'object' || data == null || Array.isArray(data)) {
    return JSON.stringify(data, null, 2);
  }

  const sorted: Record<string, unknown> = {};
  const entries = new Map(Object.entries(data));

  for (const key of keyOrder) {
    const value = entries.get(key);
    if (value != null) {
      sorted[key] = value;
    }
  }

  for (const key of Object.keys(data)) {
    const value = entries.get(key);
    if (!(key in sorted) && value != null) {
      sorted[key] = value;
    }
  }

  return JSON.stringify(sorted, null, 2);
}

function errorStringify(error: unknown): string {
  const body: Record<string, unknown> = {};

  if (isKakaoSigninError(error)) {
    const sdkMessage = error.sdkMessage ?? error.userInfo?.sdkMessage;

    body.code = error.code;
    body.message = error.message;
    if (sdkMessage != null) {
      body.sdkMessage = sdkMessage;
    }
  } else if (error instanceof Error) {
    body.message = error.message;
  } else {
    body.message = 'Unknown error';
  }

  return JSON.stringify(body, null, 2);
}

function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokenText, setTokenText] = useState('');
  const [profileText, setProfileText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [responseType, setResponseType] = useState<ResponseType>('token');

  const handleLogin = async () => {
    try {
      const token = await login();
      const nextTokenText = sortedStringify(token, TOKEN_KEY_ORDER);

      setIsLoggedIn(true);
      setTokenText(nextTokenText);
      setProfileText('');
      setResponseText(nextTokenText);
      setResponseType('token');
    } catch (error) {
      setResponseText(errorStringify(error));
      setResponseType('error');
    }
  };

  const handleShowToken = () => {
    setResponseText(tokenText);
    setResponseType('token');
  };

  const handleGetProfile = async () => {
    if (profileText) {
      setResponseText(profileText);
      setResponseType('profile');
      return;
    }

    try {
      const profile = await getProfile();
      const nextProfileText = sortedStringify(profile, PROFILE_KEY_ORDER);

      setProfileText(nextProfileText);
      setResponseText(nextProfileText);
      setResponseType('profile');
    } catch (error) {
      setResponseText(errorStringify(error));
      setResponseType('error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setTokenText('');
      setProfileText('');
      setResponseText('');
      setResponseType('token');
    } catch (error) {
      setResponseText(errorStringify(error));
      setResponseType('error');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>react-native-kakao-signin</Text>
      </View>

      <View style={styles.responseBox}>
        {responseText ? <Text style={styles.responseLabel}>{RESPONSE_LABELS[responseType]}</Text> : null}
        <ScrollView>
          <Text style={styles.responseText}>{responseText}</Text>
        </ScrollView>
      </View>

      <View style={styles.buttons}>
        {!isLoggedIn ? (
          <TouchableOpacity style={styles.kakaoButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.apiButtons}>
              <TouchableOpacity style={styles.apiButton} onPress={handleShowToken} activeOpacity={0.8}>
                <Text style={styles.apiButtonText}>토큰</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.apiButton} onPress={handleGetProfile} activeOpacity={0.8}>
                <Text style={styles.apiButtonText}>프로필</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default LoginScreen;
