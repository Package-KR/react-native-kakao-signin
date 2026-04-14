import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, type ViewStyle, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { login, logout, getProfile } from '@package-kr/react-native-kakao-signin';
import type { KakaoOAuthToken, KakaoProfile } from '@package-kr/react-native-kakao-signin';

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

function sortedStringify(data: object, keyOrder: string[]): string {
  const sorted: Record<string, any> = {};
  for (const key of keyOrder) {
    if (key in data) {
      sorted[key] = (data as any)[key] ?? null;
    }
  }
  for (const key of Object.keys(data)) {
    if (!(key in sorted)) {
      sorted[key] = (data as any)[key] ?? null;
    }
  }
  return JSON.stringify(sorted, null, 2);
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [responseText, setResponseText] = useState('');

  const handleLogin = async () => {
    try {
      const token = await login();
      setIsLoggedIn(true);
      setResponseText(sortedStringify(token, TOKEN_KEY_ORDER));
    } catch (e: any) {
      setResponseText(JSON.stringify({ error: e.code, message: e.message }, null, 2));
    }
  };

  const handleGetProfile = async () => {
    try {
      const p = await getProfile();
      setResponseText(sortedStringify(p, PROFILE_KEY_ORDER));
    } catch (e: any) {
      setResponseText(JSON.stringify({ error: e.code, message: e.message }, null, 2));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setResponseText('');
    } catch (e: any) {
      setResponseText(JSON.stringify({ error: e.code, message: e.message }, null, 2));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>react-native-kakao-signin</Text>
      </View>

      <View style={styles.responseBox}>
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
            <TouchableOpacity style={styles.profileButton} onPress={handleGetProfile} activeOpacity={0.8}>
              <Text style={styles.profileButtonText}>프로필 조회</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const baseButton: ViewStyle = {
  height: 56,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};

const baseText: TextStyle = {
  fontSize: 16,
  fontWeight: '500',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  responseBox: {
    flex: 1,
    padding: 16,
  },
  responseText: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  buttons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  kakaoButton: {
    ...baseButton,
    backgroundColor: '#FEE500',
  },
  kakaoButtonText: {
    ...baseText,
    color: '#000000',
  },
  profileButton: {
    ...baseButton,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileButtonText: {
    ...baseText,
    color: '#333333',
  },
  logoutButton: {
    ...baseButton,
    backgroundColor: '#ff4444',
  },
  logoutButtonText: {
    ...baseText,
    color: '#ffffff',
  },
});
