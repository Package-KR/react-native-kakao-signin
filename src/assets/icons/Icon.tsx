import { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../../shared/types/icon';

// Default size
export const DEFAULT_ICON_WIDTH = 21;
export const DEFAULT_ICON_HEIGHT = 20;

// Kakao
export const KakaoIcon: React.FC<IconProps> = memo(
  ({ width = DEFAULT_ICON_WIDTH, height = DEFAULT_ICON_HEIGHT, style, accessibilityLabel, testID }) => (
    <Svg
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
    >
      <Path
        d="M10.502 2.02344C5.76681 2.02344 1.92969 5.04962 1.92969 8.78468C1.92969 11.2146 3.55556 13.3465 5.9961 14.5372C5.81718 15.2045 5.34645 16.9568 5.25265 17.3311C5.13626 17.7956 5.42288 17.7904 5.61048 17.6656C5.75813 17.5668 7.95896 16.0728 8.90912 15.4298C9.42502 15.5061 9.95655 15.5459 10.5002 15.5459C15.2337 15.5459 19.0725 12.5197 19.0725 8.78468C19.0725 5.04962 15.2354 2.02344 10.502 2.02344Z"
        fill="black"
      />
    </Svg>
  ),
);

// Google
export const GoogleIcon: React.FC<IconProps> = memo(
  ({ width = DEFAULT_ICON_WIDTH, height = DEFAULT_ICON_HEIGHT, style, accessibilityLabel, testID }) => (
    <Svg
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.3229 10.1945C19.3236 9.60229 19.2719 9.01121 19.1683 8.42839H11.1574V11.7671H15.734C15.639 12.2947 15.4397 12.7972 15.1481 13.2444C14.8565 13.6916 14.4786 14.0742 14.0373 14.3691V16.5353H16.7851C18.3928 15.0326 19.3205 12.8193 19.3205 10.1929L19.3229 10.1945Z"
        fill="#3E82F1"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1598 18.6291C13.4557 18.6291 15.3807 17.8566 16.7875 16.5385L14.0397 14.3724C13.2779 14.8903 12.3037 15.1969 11.1598 15.1969C8.94477 15.1969 7.07022 13.678 6.40211 11.6378H3.56063V13.8747C4.26846 15.3044 5.354 16.5062 6.69594 17.3458C8.03789 18.1854 9.5834 18.6297 11.1598 18.6291Z"
        fill="#32A753"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.40211 11.6378C6.04642 10.5745 6.04642 9.42177 6.40211 8.35847V6.12155H3.56063C2.96593 7.32465 2.65625 8.65209 2.65625 9.99814C2.65625 11.3442 2.96593 12.6716 3.56063 13.8747L6.40211 11.6378Z"
        fill="#F9BB00"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1598 4.7994C12.4087 4.7994 13.5294 5.23524 14.4106 6.09065L16.8491 3.61468C15.3767 2.22179 13.4517 1.36719 11.1614 1.36719C9.585 1.36659 8.0395 1.8109 6.69755 2.65049C5.3556 3.49007 4.27007 4.69185 3.56224 6.12155L6.40371 8.35847C7.07182 6.31833 8.94637 4.7994 11.1614 4.7994H11.1598Z"
        fill="#E74133"
      />
    </Svg>
  ),
);

// Naver
export const NaverIcon: React.FC<IconProps> = memo(
  ({ width = DEFAULT_ICON_WIDTH, height = DEFAULT_ICON_HEIGHT, style, accessibilityLabel, testID }) => (
    <Svg
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
    >
      <Path
        d="M12.8731 10.468L7.92929 3.33203H3.83203V16.6654H8.12433V9.52936L13.0681 16.6654H17.1654V3.33203H12.8731V10.468Z"
        fill="white"
      />
    </Svg>
  ),
);

// Apple
export const AppleIcon: React.FC<IconProps> = memo(
  ({ width = DEFAULT_ICON_WIDTH, height = DEFAULT_ICON_HEIGHT, style, accessibilityLabel, testID }) => (
    <Svg
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
    >
      <Path
        d="M15.4983 10.4782C15.4905 9.04439 16.1391 7.96216 17.4518 7.16514C16.7173 6.11417 15.6077 5.53594 14.1426 5.42264C12.7556 5.31324 11.2397 6.23138 10.685 6.23138C10.0989 6.23138 8.75492 5.46171 7.70004 5.46171C5.51995 5.49687 3.20312 7.2003 3.20312 10.6658C3.20312 11.6894 3.39066 12.7469 3.76573 13.8382C4.26582 15.2721 6.07083 18.7883 7.95399 18.7297C8.93854 18.7063 9.63398 18.0304 10.9155 18.0304C12.1579 18.0304 12.8025 18.7297 13.9004 18.7297C15.7992 18.7024 17.4323 15.5065 17.9089 14.0687C15.3616 12.8693 15.4983 10.5525 15.4983 10.4782ZM13.287 4.06301C14.3536 2.79716 14.2559 1.64461 14.2247 1.23047C13.2831 1.28517 12.193 1.87121 11.5718 2.594C10.8881 3.36758 10.4857 4.32478 10.5717 5.4031C11.5914 5.48124 12.5212 4.95771 13.287 4.06301Z"
        fill="white"
      />
    </Svg>
  ),
);
