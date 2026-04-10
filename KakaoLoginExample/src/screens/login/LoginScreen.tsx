import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { login, logout, getProfile } from '@packagekr/kakao-login';
import type { KakaoProfile } from '@packagekr/kakao-login';

import { styles } from './login.styles';

function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<KakaoProfile | null>(null);
  const [response, setResponse] = useState<object | null>(null);

  const handleLogin = async () => {
    try {
      const token = await login();
      setResponse(token);
      const p = await getProfile();
      setProfile(p);
    } catch (e: any) {
      setResponse({ error: e.code, message: e.message });
    }
  };

  const handleGetProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      setResponse(p);
    } catch (e: any) {
      setResponse({ error: e.code, message: e.message });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setProfile(null);
      setResponse(null);
    } catch (e: any) {
      setResponse({ error: e.code, message: e.message });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>react-native-kakao-login</Text>
      </View>

      {/* 가운데 response */}
      <View style={styles.responseBox}>
        <ScrollView>
          <Text style={styles.responseText}>
            {response ? JSON.stringify(response, null, 2) : ''}
          </Text>
        </ScrollView>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttons}>
        {!profile ? (
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
