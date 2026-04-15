<div align="center">

# @package-kr/react-native-kakao-signin

[![npm](https://img.shields.io/npm/v/@package-kr/react-native-kakao-signin)](https://www.npmjs.com/package/@package-kr/react-native-kakao-signin)
[![npm downloads](https://img.shields.io/npm/dm/@package-kr/react-native-kakao-signin)](https://www.npmjs.com/package/@package-kr/react-native-kakao-signin)
![license](https://img.shields.io/badge/license-MIT-blue)

![iOS](https://img.shields.io/badge/iOS-13%2B-black?logo=apple&logoColor=white&labelColor=000000)
![Android](https://img.shields.io/badge/Android-API%2024%2B-3DDC84?logo=android&logoColor=white&labelColor=3DDC84)

React Native 전용 카카오 로그인 라이브러리 입니다.

<p align="center">
  <img src="./docs/images/kakao-console/preview1.png" width="45%" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./docs/images/kakao-console/preview2.png" width="45%" />
</p>

</div>

## Getting started

해당 라이브러리는 React Native `0.68` 이상을 지원합니다.<br/><br/>
`TurboModule` 기반으로 구현되어 있어 `New Architecture`를 지원하며,<br/>
`Auto Linking`이 적용되어 있어 별도 네이티브 모듈 연결 작업이 필요 없습니다.<br/>

`Expo`와 `React Native CLI` 프로젝트 모두 지원합니다.

## Prerequisites

라이브러리를 사용하려면 먼저 [카카오 개발자 콘솔](./docs/KAKAO_CONSOLE_SETUP.md)에서 앱 등록과 플랫폼 설정을 완료해야 합니다.

## Installation

```sh
npm install @package-kr/react-native-kakao-signin
```

## iOS

### 1. Info.plist 설정

`ios/{ProjectName}/Info.plist`에서 `{KAKAO_APP_KEY}` 부분을 카카오 네이티브 앱 키로 교체해주세요.

<details>
<summary>복사용</summary>

```xml
	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleTypeRole</key>
			<string>Editor</string>
			<key>CFBundleURLName</key>
			<string>KAKAO</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>kakao{KAKAO_APP_KEY}</string>
			</array>
		</dict>
	</array>
	<key>CFBundleVersion</key>
	<string>$(CURRENT_PROJECT_VERSION)</string>
	<key>KAKAO_APP_KEY</key>
	<string>{KAKAO_APP_KEY}</string>
	<key>LSApplicationQueriesSchemes</key>
	<array>
		<string>kakao{KAKAO_APP_KEY}</string>
		<string>kakaokompassauth</string>
		<string>kakaotalk</string>
	</array>
```

</details>

```diff
	<!-- Info.plist -->
	<key>CFBundleURLTypes</key>
	<array>
+		<dict>
+			<key>CFBundleTypeRole</key>
+			<string>Editor</string>
+			<key>CFBundleURLName</key>
+			<string>KAKAO</string>
+			<key>CFBundleURLSchemes</key>
+			<array>
+				<string>kakao{KAKAO_APP_KEY}</string>
+			</array>
+		</dict>
	</array>
	<key>CFBundleVersion</key>
	<string>$(CURRENT_PROJECT_VERSION)</string>
+	<key>KAKAO_APP_KEY</key>
+	<string>{KAKAO_APP_KEY}</string>
+	<key>LSApplicationQueriesSchemes</key>
+	<array>
+		<string>kakaoa{KAKAO_APP_KEY}</string>
+		<string>kakaokompassauth</string>
+		<string>kakaotalk</string>
+	</array>
```

### 2. AppDelegate 설정

`ios/{ProjectName}/AppDelegate.swift`에 카카오 로그인 URL 처리 코드를 추가합니다.

> **Expo 사용자는 이 단계를 건너뛰세요.** Config Plugin이 자동으로 처리합니다.

```swift
import KakaoSDKAuth // 상단에 추가

// AppDelegate 클래스 안에 메서드 추가
func application(
  _ app: UIApplication,
  open url: URL,
  options: [UIApplication.OpenURLOptionsKey: Any] = [:]
) -> Bool {
  if AuthApi.isKakaoTalkLoginUrl(url) {
    return AuthController.handleOpenUrl(url: url)
  }
  return false
}
```

### 3. CocoaPods 설치

```sh
cd ios && pod install
```

## Expo

### 1. Config Plugin 설정

`app.json` 또는 `app.config.js`에 플러그인을 추가합니다.

```json
{
  "expo": {
    "plugins": [
      [
        "@package-kr/react-native-kakao-signin",
        {
          "kakaoAppKey": "{KAKAO_APP_KEY}"
        }
      ]
    ]
  }
}
```

> Info.plist 설정과 AppDelegate 코드 주입이 자동으로 처리됩니다.

### 2. 빌드

```sh
npx expo run:ios
```

## Android

### 1. Redirect URI 설정

`app/src/main/AndroidManifest.xml`에 카카오 리다이렉트 액티비티를 추가합니다.<br/>
`{KAKAO_APP_KEY}` 부분을 카카오 네이티브 앱 키로 교체해주세요.

사용자 휴대폰에 카카오 앱이 설치되어 있을 경우 로그인 후 앱으로 돌아오기 위한 설정입니다.<br/>
Android 12(API 31) 이상을 타깃하는 경우 `android:exported="true"` 를 반드시 선언해주셔야 합니다.

```xml
	  <!-- AndroidManifest.xml -->
      <activity
        android:name="com.kakao.sdk.auth.AuthCodeHandlerActivity"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:host="oauth" android:scheme="kakao{KAKAO_APP_KEY}" />
        </intent-filter>
      </activity>
```

### 2. 카카오 앱 키 설정

`app/src/main/res/values/strings.xml`에 카카오 앱 키를 추가합니다.<br/>
카카오 SDK가 앱 키를 자동으로 읽어오기 위한 설정입니다.

```diff
  <resources>
      <string name="app_name">YourAppName</string>
+     <string name="kakao_app_key">{KAKAO_APP_KEY}</string>
  </resources>
```

## Usage

더 많은 사용 예제는 [KakaoLoginCliExample](https://github.com/Package-KR/react-native-kakao-signin/tree/main/KakaoLoginCliExample) 프로젝트를 참고해주세요.

```ts
import {
  login,
  loginWithKakaoAccount,
  logout,
  unlink,
  getProfile,
  getAccessToken,
  shippingAddresses,
  serviceTerms,
} from '@package-kr/react-native-kakao-signin';

// 카카오톡으로 로그인 (카카오톡 미설치 시 카카오계정으로 자동 전환)
const token = await login();

// 카카오계정으로 로그인
const token = await loginWithKakaoAccount();

// 로그아웃
await logout();

// 연결 해제
await unlink();

// 프로필 조회
const profile = await getProfile();

// 토큰 조회
const token = await getAccessToken();

// 배송주소 조회
const addresses = await shippingAddresses();

// 서비스 약관 조회
const terms = await serviceTerms();
```

---

## Methods

| 메서드                    | 설명                                                                                 | Returns                           |
| ------------------------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| `login()`                 | 카카오톡으로 로그인합니다. 카카오톡 미설치 시 카카오계정 로그인으로 자동 전환됩니다. | `Promise<KakaoOAuthToken>`        |
| `loginWithKakaoAccount()` | 카카오계정으로 로그인합니다.                                                         | `Promise<KakaoOAuthToken>`        |
| `logout()`                | 로그아웃합니다.                                                                      | `Promise<string>`                 |
| `unlink()`                | 카카오 계정 연결을 해제합니다.                                                       | `Promise<string>`                 |
| `getProfile()`            | 사용자 프로필을 조회합니다.                                                          | `Promise<KakaoProfile>`           |
| `getAccessToken()`        | 현재 저장된 액세스 토큰을 조회합니다.                                                | `Promise<KakaoAccessTokenInfo>`   |
| `shippingAddresses()`     | 사용자 배송주소 목록을 조회합니다.                                                   | `Promise<KakaoShippingAddresses>` |
| `serviceTerms()`          | 서비스 약관 동의 내역을 조회합니다.                                                  | `Promise<KakaoServiceTerms>`      |

---

## Types

### `KakaoOAuthToken`

| 필드                    | 타입               | 설명                     |
| ----------------------- | ------------------ | ------------------------ |
| `accessToken`           | `string`           | 액세스 토큰              |
| `refreshToken`          | `string`           | 리프레시 토큰            |
| `idToken`               | `string \| null`   | ID 토큰 (OpenID Connect) |
| `accessTokenExpiresAt`  | `string`           | 액세스 토큰 만료 시각    |
| `refreshTokenExpiresAt` | `string`           | 리프레시 토큰 만료 시각  |
| `scopes`                | `string[] \| null` | 인증된 스코프 목록       |

### `KakaoProfile`

| 필드                            | 타입              | 설명                              |
| ------------------------------- | ----------------- | --------------------------------- |
| `id`                            | `number \| null`  | 사용자 ID                         |
| `nickname`                      | `string \| null`  | 닉네임                            |
| `name`                          | `string \| null`  | 이름                              |
| `email`                         | `string \| null`  | 이메일                            |
| `profileImageUrl`               | `string \| null`  | 프로필 이미지 URL                 |
| `thumbnailImageUrl`             | `string \| null`  | 프로필 썸네일 이미지 URL          |
| `gender`                        | `string \| null`  | 성별                              |
| `ageRange`                      | `string \| null`  | 연령대                            |
| `birthday`                      | `string \| null`  | 생일 (MMDD)                       |
| `birthdayType`                  | `string \| null`  | 생일 타입 (SOLAR/LUNAR)           |
| `birthyear`                     | `string \| null`  | 출생 연도                         |
| `phoneNumber`                   | `string \| null`  | 전화번호                          |
| `isEmailValid`                  | `boolean \| null` | 이메일 유효 여부                  |
| `isEmailVerified`               | `boolean \| null` | 이메일 인증 여부                  |
| `isKorean`                      | `boolean \| null` | 한국인 여부                       |
| `isDefaultImage`                | `boolean \| null` | 기본 프로필 이미지 여부           |
| `isLeapMonth`                   | `boolean \| null` | 생일 윤달 여부 (Android only)     |
| `connectedAt`                   | `string \| null`  | 서비스 연결 시각                  |
| `synchedAt`                     | `string \| null`  | 카카오싱크 로그인 시각            |
| `ci`                            | `string \| null`  | 연계정보 (iOS only)               |
| `ciAuthenticatedAt`             | `string \| null`  | CI 발급 시각 (iOS only)           |
| `legalName`                     | `string \| null`  | 법정 이름                         |
| `legalBirthDate`                | `string \| null`  | 법정 생년월일                     |
| `legalGender`                   | `string \| null`  | 법정 성별                         |
| `emailNeedsAgreement`           | `boolean \| null` | 이메일 제공 동의 필요 여부        |
| `profileNeedsAgreement`         | `boolean \| null` | 프로필 제공 동의 필요 여부        |
| `phoneNumberNeedsAgreement`     | `boolean \| null` | 전화번호 제공 동의 필요 여부      |
| `genderNeedsAgreement`          | `boolean \| null` | 성별 제공 동의 필요 여부          |
| `ageRangeNeedsAgreement`        | `boolean \| null` | 연령대 제공 동의 필요 여부        |
| `birthdayNeedsAgreement`        | `boolean \| null` | 생일 제공 동의 필요 여부          |
| `birthyearNeedsAgreement`       | `boolean \| null` | 출생 연도 제공 동의 필요 여부     |
| `isKoreanNeedsAgreement`        | `boolean \| null` | 한국인 여부 제공 동의 필요 여부   |
| `profileNicknameNeedsAgreement` | `boolean \| null` | 닉네임 제공 동의 필요 여부        |
| `profileImageNeedsAgreement`    | `boolean \| null` | 프로필 이미지 제공 동의 필요 여부 |
| `nameNeedsAgreement`            | `boolean \| null` | 이름 제공 동의 필요 여부          |
| `ciNeedsAgreement`              | `boolean \| null` | CI 제공 동의 필요 여부 (iOS only) |
| `legalNameNeedsAgreement`       | `boolean \| null` | 법정 이름 제공 동의 필요 여부     |
| `legalBirthDateNeedsAgreement`  | `boolean \| null` | 법정 생년월일 제공 동의 필요 여부 |
| `legalGenderNeedsAgreement`     | `boolean \| null` | 법정 성별 제공 동의 필요 여부     |

### `KakaoAccessTokenInfo`

| 필드          | 타입     | 설명                    |
| ------------- | -------- | ----------------------- |
| `accessToken` | `string` | 액세스 토큰             |
| `expiresIn`   | `string` | 만료까지 남은 시간 (초) |

### `KakaoShippingAddresses`

| 필드                | 타입                     | 설명           |
| ------------------- | ------------------------ | -------------- |
| `userId`            | `string`                 | 사용자 ID      |
| `needsAgreement`    | `boolean`                | 동의 필요 여부 |
| `shippingAddresses` | `KakaoShippingAddress[]` | 배송주소 목록  |

### `KakaoShippingAddress`

| 필드                   | 타입      | 설명              |
| ---------------------- | --------- | ----------------- |
| `id`                   | `string`  | 배송주소 ID       |
| `name`                 | `string`  | 배송지명          |
| `isDefault`            | `boolean` | 기본 배송지 여부  |
| `updatedAt`            | `string`  | 수정 시각         |
| `type`                 | `string`  | 배송지 타입       |
| `baseAddress`          | `string`  | 기본 주소         |
| `detailAddress`        | `string`  | 상세 주소         |
| `receiverName`         | `string`  | 수령인 이름       |
| `receiverPhoneNumber1` | `string`  | 수령인 전화번호 1 |
| `receiverPhoneNumber2` | `string`  | 수령인 전화번호 2 |
| `zoneNumber`           | `string`  | 우편번호          |
| `zipCode`              | `string`  | 구 우편번호       |

### `KakaoServiceTerms`

| 필드           | 타입                 | 설명             |
| -------------- | -------------------- | ---------------- |
| `userId`       | `string`             | 사용자 ID        |
| `serviceTerms` | `KakaoServiceTerm[]` | 서비스 약관 목록 |

### `KakaoServiceTerm`

| 필드        | 타입                  | 설명           |
| ----------- | --------------------- | -------------- |
| `tag`       | `string`              | 약관 태그      |
| `agreed`    | `boolean`             | 동의 여부      |
| `required`  | `boolean`             | 필수 여부      |
| `revocable` | `boolean`             | 철회 가능 여부 |
| `agreedAt`  | `string \| undefined` | 동의 시각      |

## Kakao SDK 버전 오버라이드

기본적으로 Kakao SDK `2.22.0`을 사용합니다. 호스트 앱에서 다른 버전을 사용해야 하는 경우 아래와 같이 오버라이드할 수 있습니다.

### Expo

`app.json`에서 `overrideKakaoSDKVersion`을 지정합니다.

```json
{
  "expo": {
    "plugins": [
      [
        "@package-kr/react-native-kakao-signin",
        {
          "kakaoAppKey": "{KAKAO_APP_KEY}",
          "overrideKakaoSDKVersion": "2.23.0"
        }
      ]
    ]
  }
}
```

### CLI (iOS)

`ios/Podfile` 상단에 전역변수를 선언합니다.

```ruby
$KakaoSDKVersion = "2.23.0"
```

### CLI (Android)

`android/build.gradle`의 `ext` 블록에 속성을 추가합니다.

```gradle
buildscript {
    ext {
        kakaoSdkVersion = "2.23.0"
    }
}
```

## 테스트 환경

| 환경 | 패키지 버전 | RN 버전 | KakaoSDK 버전 | 마지막 테스트 | 동작 여부 |
|------|------------|---------|--------------|-------------|----------|
| CLI iOS | 1.0.7 | 0.85.0 | 2.22.0 | 2026-04-15 | ✅ |
| CLI Android | 1.0.7 | 0.85.0 | 2.22.0 | 2026-04-15 | ✅ |
| Expo iOS | 1.0.7 | SDK 54 | 2.22.0 | 2026-04-15 | ✅ |
| Expo Android | 1.0.7 | SDK 54 | 2.22.0 | 2026-04-15 | ✅ |

## 라이선스

MIT
