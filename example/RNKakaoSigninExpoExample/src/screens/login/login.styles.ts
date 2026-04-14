import { StyleSheet, type ViewStyle, type TextStyle } from 'react-native';

const baseButtonStyle: ViewStyle = {
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

const baseTextStyle: TextStyle = {
  fontSize: 16,
  fontWeight: '500',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // 상단 헤더
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

  // 가운데 response
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

  // 하단 버튼
  buttons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  kakaoButton: {
    ...baseButtonStyle,
    backgroundColor: '#FEE500',
  },
  kakaoButtonText: {
    ...baseTextStyle,
    color: '#000000',
  },
  profileButton: {
    ...baseButtonStyle,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileButtonText: {
    ...baseTextStyle,
    color: '#333333',
  },
  logoutButton: {
    ...baseButtonStyle,
    backgroundColor: '#ff4444',
  },
  logoutButtonText: {
    ...baseTextStyle,
    color: '#ffffff',
  },
});
