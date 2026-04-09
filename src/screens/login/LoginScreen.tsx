import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { login, logout, getProfile, unlink } from '@packagekr/kakao-login';
import type { KakaoOAuthToken, KakaoProfile } from '@packagekr/kakao-login';

import { KakaoIcon, GoogleIcon, NaverIcon, AppleIcon } from '../../assets/icons/Icon';
import type { SocialProvider } from '../../shared/types/auth.shared.types';
import { loginButtonStyles, loginButtonTextStyles, styles } from './login.styles';

const providerLabel: Record<SocialProvider, string> = {
  kakao: '카카오로 시작하기',
  google: 'Google로 시작하기',
  naver: '네이버로 시작하기',
  apple: 'Apple로 시작하기',
};

const ProviderIcon = ({ provider }: { provider: SocialProvider }) => {
  switch (provider) {
    case 'kakao':
      return <KakaoIcon style={styles.loginIcon} />;
    case 'google':
      return <GoogleIcon style={styles.loginIcon} />;
    case 'naver':
      return <NaverIcon style={styles.loginIcon} />;
    case 'apple':
      return <AppleIcon style={styles.loginIcon} />;
  }
};

type LoggedInState = {
  token: KakaoOAuthToken;
  profile: KakaoProfile;
};

function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [loggedIn, setLoggedIn] = useState<LoggedInState | null>(null);

  const handleLogin = async (provider: SocialProvider) => {
    if (provider !== 'kakao') return;
    try {
      const token = await login();
      const profile = await getProfile();
      setLoggedIn({ token, profile });
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLoggedIn(null);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const handleUnlink = async () => {
    try {
      await unlink();
      setLoggedIn(null);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const providers: SocialProvider[] = ['kakao', 'google', 'naver', 'apple'];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>react-native-social-login</Text>
      </View>

      {/* 로그인/로그아웃 버튼 영역 */}
      <View style={styles.content}>
        {!loggedIn ? (
          <>
            {providers.map(provider => (
              <View key={provider} style={styles.loginButtonContainer}>
                <TouchableOpacity
                  style={loginButtonStyles[provider]}
                  onPress={() => handleLogin(provider)}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonContent}>
                    <ProviderIcon provider={provider} />
                    <Text style={loginButtonTextStyles[provider]}>{providerLabel[provider]}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.nickname}>{loggedIn.profile.nickname}</Text>
            <View style={styles.loginButtonContainer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.logoutButtonText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.loginButtonContainer}>
              <TouchableOpacity style={styles.unlinkButton} onPress={handleUnlink} activeOpacity={0.8}>
                <Text style={styles.unlinkButtonText}>연결 끊기</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export default LoginScreen;
