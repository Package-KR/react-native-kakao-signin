import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import type { SocialProvider } from '../../shared/types/auth.shared.types';

const baseButtonStyle: ViewStyle = {
  backgroundColor: '#ffffff',
  height: 56,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};

const loginButtonStyleMap: Record<SocialProvider, ViewStyle> = {
  kakao: {
    ...baseButtonStyle,
    backgroundColor: '#FEE500',
  },
  google: {
    ...baseButtonStyle,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  naver: {
    ...baseButtonStyle,
    backgroundColor: '#03C75A',
  },
  apple: {
    ...baseButtonStyle,
    backgroundColor: '#000000',
  },
};

const baseTextStyle: TextStyle = {
  fontSize: 16,
  fontWeight: '500',
};

const loginButtonTextStyleMap: Record<SocialProvider, TextStyle> = {
  kakao: {
    ...baseTextStyle,
    color: '#000000',
  },
  google: {
    ...baseTextStyle,
    color: '#000000',
  },
  naver: {
    ...baseTextStyle,
    color: '#ffffff',
  },
  apple: {
    ...baseTextStyle,
    color: '#ffffff',
  },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  responseBox: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  responseText: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 24,
  },
  loginButtonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginIcon: {
    marginRight: 8,
  },
  logoutButton: {
    ...baseButtonStyle,
    backgroundColor: '#ff4444',
  },
  logoutButtonText: {
    ...baseTextStyle,
    color: '#ffffff',
  },
  unlinkButton: {
    ...baseButtonStyle,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unlinkButtonText: {
    ...baseTextStyle,
    color: '#999999',
  },
});

export const loginButtonStyles = StyleSheet.create(loginButtonStyleMap);
export const loginButtonTextStyles = StyleSheet.create(loginButtonTextStyleMap);
