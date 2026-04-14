import type { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}
