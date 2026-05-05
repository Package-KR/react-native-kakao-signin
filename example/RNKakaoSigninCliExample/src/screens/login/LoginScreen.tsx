import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { login, logout, getProfile } from '@package-kr/react-native-kakao-signin';
import type { KakaoOAuthToken, KakaoProfile } from '@package-kr/react-native-kakao-signin';

import { styles } from './login.styles';

const TOKEN_KEY_ORDER: (keyof KakaoOAuthToken)[] = [
  'accessToken',
  'refreshToken',
  'idToken',
  'accessTokenExpiresAt',
  'refreshTokenExpiresAt',
  'scopes',
];

const PROFILE_KEY_ORDER: (keyof KakaoProfile)[] = [
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
];

// 중요도 순서대로 키를 정렬하여 JSON 변환
function sortedStringify(data: object, keyOrder: string[]): string {
  const sorted: Record<string, any> = {};
  // keyOrder에 정의된 순서대로 먼저 넣고
  for (const key of keyOrder) {
    const value = (data as any)[key];

    if (value != null) {
      sorted[key] = value;
    }
  }

  // keyOrder에 없는 키는 뒤에 추가
  for (const key of Object.keys(data)) {
    const value = (data as any)[key];

    if (!(key in sorted) && value != null) {
      sorted[key] = value;
    }
  }
  return JSON.stringify(sorted, null, 2);
}

// 에러 응답 변환
function errorStringify(error: any): string {
  const body: Record<string, any> = {};

  if (error?.code != null) {
    body.code = error.code;
  }

  if (error?.message != null) {
    body.message = error.message;
  }

  if (error?.sdkMessage != null) {
    body.sdkMessage = error.sdkMessage;
  }

  return JSON.stringify(
    body,
    null,
    2
  );
}

function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [responseText, setResponseText] = useState('');

  const handleLogin = async () => {
    try {
      const token = await login();
      setIsLoggedIn(true);
      setResponseText(sortedStringify(token, TOKEN_KEY_ORDER));
    } catch (e: any) {
      setResponseText(errorStringify(e));
    }
  };

  const handleGetProfile = async () => {
    try {
      const p = await getProfile();
      setResponseText(sortedStringify(p, PROFILE_KEY_ORDER));
    } catch (e: any) {
      setResponseText(errorStringify(e));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setResponseText('');
    } catch (e: any) {
      setResponseText(errorStringify(e));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>react-native-kakao-signin</Text>
      </View>

      {/* 가운데 response */}
      <View style={styles.responseBox}>
        <ScrollView>
          <Text style={styles.responseText}>{responseText}</Text>
        </ScrollView>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttons}>
        {!isLoggedIn ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.kakaoButton} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.profileButton} onPress={handleGetProfile} activeOpacity={0.8}>
                <Text style={styles.profileButtonText}>프로필 조회</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.logoutButtonText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export default LoginScreen;
