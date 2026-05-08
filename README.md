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

## React Native CLI

### iOS

#### 1. Info.plist 설정

`ios/{ProjectName}/Info.plist`에서 `{KAKAO_APP_KEY}` 부분을 카카오 네이티브 앱 키로 교체해주세요.
앱 키에는 `kakao` 접두사를 붙이지 않습니다. URL scheme은 기본적으로 `kakao{KAKAO_APP_KEY}` 형식을 사용합니다.

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
	<key>KAKAO_APP_KEY</key>
	<string>{KAKAO_APP_KEY}</string>
	<!-- 선택 사항: 멀티 플랫폼 앱 구현이나 커스텀 URL scheme 사용 시에만 추가합니다. -->
	<!--
	<key>KAKAO_APP_SCHEME</key>
	<string>{CUSTOM_SCHEME}</string>
	-->
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
+ 	<key>CFBundleURLTypes</key>
+	  <array>
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
+	  </array>
+	<key>KAKAO_APP_KEY</key>
+	<string>{KAKAO_APP_KEY}</string>
+	<!-- 선택 사항: 멀티 플랫폼 앱 구현이나 커스텀 URL scheme 사용 시에만 추가합니다. -->
+	<!--
+	<key>KAKAO_APP_SCHEME</key>
+	<string>{CUSTOM_SCHEME}</string>
+	-->
+	<key>LSApplicationQueriesSchemes</key>
+	<array>
+		<string>kakao{KAKAO_APP_KEY}</string>
+		<string>kakaokompassauth</string>
+		<string>kakaotalk</string>
+	</array>
```

#### 2. AppDelegate 설정

`ios/{ProjectName}/AppDelegate.swift`에 카카오 로그인 URL 처리 코드를 추가합니다.

```swift
import React
import RNKakaoSignin // 상단에 추가

// AppDelegate 클래스 안에 메서드 추가
func application(
  _ app: UIApplication,
  open url: URL,
  options: [UIApplication.OpenURLOptionsKey: Any] = [:]
) -> Bool {
  if RNKakaoSignin.handleOpen(url) {
    return true
  }

  return RCTLinkingManager.application(app, open: url, options: options)
}
```

#### 3. CocoaPods 설치

```sh
cd ios && pod install
```

### Android

#### 1. Redirect URI 설정

`app/src/main/AndroidManifest.xml`에 카카오 리다이렉트 액티비티를 추가합니다.<br/>
`{KAKAO_APP_KEY}` 부분을 카카오 네이티브 앱 키로 교체해주세요.
앱 키에는 `kakao` 접두사를 붙이지 않고, `android:scheme`에만 `kakao{KAKAO_APP_KEY}` 형식으로 사용합니다.

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

#### 2. 카카오 앱 키 설정

`app/src/main/res/values/strings.xml`에 카카오 앱 키를 추가합니다.<br/>
카카오 SDK가 앱 키를 자동으로 읽어오기 위한 설정입니다.

```diff
  <resources>
      <string name="app_name">YourAppName</string>
+     <string name="kakao_app_key">{KAKAO_APP_KEY}</string>
+     <!-- 선택 사항: 멀티 플랫폼 앱 구현이나 커스텀 URL scheme 사용 시에만 추가합니다. -->
+     <!-- <string name="kakao_custom_scheme">{CUSTOM_SCHEME}</string> -->
  </resources>
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

> iOS Info.plist/AppDelegate와 Android Manifest/strings.xml/Kakao Maven 저장소 설정이 자동으로 처리됩니다.
> `kakaoAppKey`에는 `kakao` 접두사를 붙이지 않습니다. 기본 URL scheme은 `kakao{KAKAO_APP_KEY}`로 자동 설정됩니다.

커스텀 URL scheme을 사용하는 경우 `kakaoAppScheme`을 추가합니다.

```json
{
  "expo": {
    "plugins": [
      [
        "@package-kr/react-native-kakao-signin",
        {
          "kakaoAppKey": "{KAKAO_APP_KEY}",
          "kakaoAppScheme": "{CUSTOM_SCHEME}"
        }
      ]
    ]
  }
}
```

### 2. 빌드

```sh
npx expo run:ios
```

## Usage

더 많은 사용 예제는 [RNKakaoSigninCliExample](https://github.com/Package-KR/react-native-kakao-signin/tree/main/example/RNKakaoSigninCliExample) 프로젝트를 참고해주세요.

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
const kakaoTalkToken = await login();

// 카카오계정으로 로그인
const kakaoAccountToken = await loginWithKakaoAccount();

// 로그아웃
await logout();

// 연결 해제
await unlink();

// 프로필 조회
const profile = await getProfile();

// 토큰 조회
const accessTokenInfo = await getAccessToken();

// 배송주소 조회
const addresses = await shippingAddresses();

// 서비스 약관 조회
const terms = await serviceTerms();
```

---

## Methods

| 메서드                    | 설명                                                                                 | Returns                                 |
| ------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------- |
| `login()`                 | 카카오톡으로 로그인합니다. 카카오톡 미설치 시 카카오계정 로그인으로 자동 전환됩니다. | `Promise<KakaoOAuthToken>`              |
| `loginWithKakaoAccount()` | 카카오계정으로 로그인합니다.                                                         | `Promise<KakaoOAuthToken>`              |
| `logout()`                | 로그아웃합니다.                                                                      | `Promise<boolean>`                      |
| `unlink()`                | 카카오 계정 연결을 해제합니다.                                                       | `Promise<boolean>`                      |
| `getProfile()`            | 사용자 프로필을 조회합니다.                                                          | `Promise<KakaoProfile>`                 |
| `getAccessToken()`        | 현재 저장된 액세스 토큰을 조회합니다.                                                | `Promise<KakaoAccessTokenInfo \| null>` |
| `shippingAddresses()`     | 사용자 배송주소 목록을 조회합니다.                                                   | `Promise<KakaoShippingAddresses>`       |
| `serviceTerms()`          | 서비스 약관 동의 내역을 조회합니다.                                                  | `Promise<KakaoServiceTerms>`            |

---

## Error Handling

네이티브 설정, SDK 초기화, 로그인, API 호출 중 오류가 발생하면 `Promise`가 reject됩니다.

이 라이브러리는 Kakao SDK 원문 오류를 그대로 `message`에 넣지 않고, 아래 구조로 정리해서 전달합니다.

```ts
{
  code: 'KAKAO_INVALID_APP_KEY',
  message: 'The Kakao native app key is invalid. Please check your Kakao app key configuration.',
  userInfo: {
    sdkMessage: 'invalid_client ...',
  },
}
```

| 필드                  | 설명                                             |
| --------------------- | ------------------------------------------------ |
| `code`                | 앱에서 분기 처리하기 위한 안정적인 에러 코드     |
| `message`             | 라이브러리가 제공하는 기본 영어 원인/조치 메시지 |
| `userInfo.sdkMessage` | Kakao SDK 또는 네이티브에서 전달된 원문 메시지   |

`userInfo.sdkMessage`는 SDK가 원문 메시지를 제공할 때만 포함됩니다. 사용자에게 그대로 노출하기보다는 개발 중 설정 문제를 확인하는 용도로 사용하는 것을 권장합니다.

---

## Types

아래 타입 표는 필드가 포함될 때의 값 타입을 기준으로 설명합니다. 선택 필드는 값이 없으면 `null`로 내려오지 않고 응답에서 생략됩니다.

### `KakaoSigninError`

| 필드                  | 타입                  | 설명                                                        |
| --------------------- | --------------------- | ----------------------------------------------------------- |
| `code`                | `KakaoErrorCode`      | 네이티브 모듈에서 전달한 안정적인 에러 코드                 |
| `message`             | `string`              | 라이브러리가 제공하는 영어 원인/조치 메시지                 |
| `sdkMessage`          | `string \| undefined` | 일부 React Native 런타임에서 노출될 수 있는 SDK 원문 메시지 |
| `userInfo.sdkMessage` | `string \| undefined` | Kakao SDK 또는 네이티브에서 전달된 원문 메시지              |

### `KakaoErrorCode`

| 코드                                 | 설명                                        |
| ------------------------------------ | ------------------------------------------- |
| `KAKAO_ACTIVITY_DOES_NOT_EXIST`      | 현재 Activity 없음                          |
| `KAKAO_ACCESS_DENIED`                | 사용자 취소 또는 접근 거부                  |
| `KAKAO_API_ERROR`                    | 카카오 API 오류                             |
| `KAKAO_AUTH_ERROR`                   | 카카오 인증 오류                            |
| `KAKAO_BAD_PARAMETER`                | 잘못된 파라미터                             |
| `KAKAO_CANCELLED`                    | 사용자 취소                                 |
| `KAKAO_CLIENT_ERROR`                 | 클라이언트 오류                             |
| `KAKAO_ERROR`                        | 일반 오류                                   |
| `KAKAO_FORBIDDEN`                    | 권한 부족                                   |
| `KAKAO_ILLEGAL_STATE`                | 잘못된 상태                                 |
| `KAKAO_INVALID_APP_KEY`              | 앱 키 설정 오류                             |
| `KAKAO_INVALID_BUNDLE_ID`            | iOS 번들 ID 또는 Android 패키지명 설정 오류 |
| `KAKAO_INVALID_CLIENT`               | 클라이언트 설정 오류                        |
| `KAKAO_INVALID_GRANT`                | 인가 정보 오류                              |
| `KAKAO_INVALID_REQUEST`              | 잘못된 로그인 요청                          |
| `KAKAO_INVALID_SCOPE`                | 잘못된 동의 항목                            |
| `KAKAO_INVALID_URL_SCHEME`           | URL scheme 설정 오류                        |
| `KAKAO_LOGIN_REQUIRED`               | 로그인 권한 필요                            |
| `KAKAO_MISCONFIGURED`                | 카카오 플랫폼 설정 오류                     |
| `KAKAO_NOT_SUPPORTED`                | 지원하지 않는 기능                          |
| `KAKAO_PROFILE_NOT_FOUND`            | 프로필 정보 없음                            |
| `KAKAO_RATE_LIMIT`                   | 요청 제한 초과                              |
| `KAKAO_SERVER_ERROR`                 | 카카오 서버 오류                            |
| `KAKAO_SHIPPING_ADDRESSES_NOT_FOUND` | 배송지 정보 없음                            |
| `KAKAO_TOKEN_EXPIRED`                | 토큰 만료                                   |
| `KAKAO_TOKEN_NOT_FOUND`              | 토큰 없음                                   |
| `KAKAO_UNKNOWN_ERROR`                | 알 수 없는 오류                             |

### `KakaoOAuthToken`

| 필드                    | 타입       | 설명                     |
| ----------------------- | ---------- | ------------------------ |
| `accessToken`           | `string`   | 액세스 토큰              |
| `refreshToken`          | `string`   | 리프레시 토큰            |
| `idToken`               | `string`   | ID 토큰 (OpenID Connect) |
| `accessTokenExpiresAt`  | `string`   | 액세스 토큰 만료 시각    |
| `refreshTokenExpiresAt` | `string`   | 리프레시 토큰 만료 시각  |
| `scopes`                | `string[]` | 인증된 스코프 목록       |

### `KakaoProfile`

| 필드                            | 타입                              | 설명                              |
| ------------------------------- | --------------------------------- | --------------------------------- |
| `id`                            | `string`                          | 사용자 ID                         |
| `nickname`                      | `string`                          | 닉네임                            |
| `name`                          | `string`                          | 이름                              |
| `email`                         | `string`                          | 이메일                            |
| `profileImageUrl`               | `string`                          | 프로필 이미지 URL                 |
| `thumbnailImageUrl`             | `string`                          | 프로필 썸네일 이미지 URL          |
| `gender`                        | `string`                          | 성별                              |
| `ageRange`                      | `string`                          | 연령대                            |
| `birthday`                      | `string`                          | 생일 (MMDD)                       |
| `birthdayType`                  | `'solar' \| 'lunar' \| 'unknown'` | 생일 타입                         |
| `birthyear`                     | `string`                          | 출생 연도                         |
| `phoneNumber`                   | `string`                          | 전화번호                          |
| `isEmailValid`                  | `boolean`                         | 이메일 유효 여부                  |
| `isEmailVerified`               | `boolean`                         | 이메일 인증 여부                  |
| `isKorean`                      | `boolean`                         | 한국인 여부                       |
| `isDefaultImage`                | `boolean`                         | 기본 프로필 이미지 여부           |
| `isLeapMonth`                   | `boolean`                         | 생일 윤달 여부 (Android only)     |
| `connectedAt`                   | `string`                          | 서비스 연결 시각                  |
| `synchedAt`                     | `string`                          | 카카오싱크 로그인 시각            |
| `ci`                            | `string`                          | 연계정보 (iOS only)               |
| `ciAuthenticatedAt`             | `string`                          | CI 발급 시각 (iOS only)           |
| `legalName`                     | `string`                          | 법정 이름                         |
| `legalBirthDate`                | `string`                          | 법정 생년월일                     |
| `legalGender`                   | `string`                          | 법정 성별                         |
| `emailNeedsAgreement`           | `boolean`                         | 이메일 제공 동의 필요 여부        |
| `profileNeedsAgreement`         | `boolean`                         | 프로필 제공 동의 필요 여부        |
| `phoneNumberNeedsAgreement`     | `boolean`                         | 전화번호 제공 동의 필요 여부      |
| `genderNeedsAgreement`          | `boolean`                         | 성별 제공 동의 필요 여부          |
| `ageRangeNeedsAgreement`        | `boolean`                         | 연령대 제공 동의 필요 여부        |
| `birthdayNeedsAgreement`        | `boolean`                         | 생일 제공 동의 필요 여부          |
| `birthyearNeedsAgreement`       | `boolean`                         | 출생 연도 제공 동의 필요 여부     |
| `isKoreanNeedsAgreement`        | `boolean`                         | 한국인 여부 제공 동의 필요 여부   |
| `profileNicknameNeedsAgreement` | `boolean`                         | 닉네임 제공 동의 필요 여부        |
| `profileImageNeedsAgreement`    | `boolean`                         | 프로필 이미지 제공 동의 필요 여부 |
| `nameNeedsAgreement`            | `boolean`                         | 이름 제공 동의 필요 여부          |
| `ciNeedsAgreement`              | `boolean`                         | CI 제공 동의 필요 여부 (iOS only) |
| `legalNameNeedsAgreement`       | `boolean`                         | 법정 이름 제공 동의 필요 여부     |
| `legalBirthDateNeedsAgreement`  | `boolean`                         | 법정 생년월일 제공 동의 필요 여부 |
| `legalGenderNeedsAgreement`     | `boolean`                         | 법정 성별 제공 동의 필요 여부     |

### `KakaoAccessTokenInfo`

| 필드          | 타입     | 설명                    |
| ------------- | -------- | ----------------------- |
| `accessToken` | `string` | 액세스 토큰             |
| `expiresIn`   | `number` | 만료까지 남은 시간 (초) |

### `KakaoShippingAddresses`

| 필드                | 타입                     | 설명           |
| ------------------- | ------------------------ | -------------- |
| `userId`            | `string`                 | 사용자 ID      |
| `needsAgreement`    | `boolean`                | 동의 필요 여부 |
| `shippingAddresses` | `KakaoShippingAddress[]` | 배송주소 목록  |

### `KakaoShippingAddress`

| 필드                   | 타입                          | 설명              |
| ---------------------- | ----------------------------- | ----------------- |
| `id`                   | `string`                      | 배송주소 ID       |
| `name`                 | `string`                      | 배송지명          |
| `isDefault`            | `boolean`                     | 기본 배송지 여부  |
| `updatedAt`            | `string`                      | 수정 시각         |
| `type`                 | `'old' \| 'new' \| 'unknown'` | 배송지 타입       |
| `baseAddress`          | `string`                      | 기본 주소         |
| `detailAddress`        | `string`                      | 상세 주소         |
| `receiverName`         | `string`                      | 수령인 이름       |
| `receiverPhoneNumber1` | `string`                      | 수령인 전화번호 1 |
| `receiverPhoneNumber2` | `string`                      | 수령인 전화번호 2 |
| `zoneNumber`           | `string`                      | 우편번호          |
| `zipCode`              | `string`                      | 구 우편번호       |

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

| 환경         | 패키지 버전 | RN / Expo 버전          | KakaoSDK 버전 | 마지막 테스트 | 동작 여부 |
| ------------ | ----------- | ----------------------- | ------------- | ------------- | --------- |
| CLI iOS      | 최신 버전   | React Native 0.85.3     | 2.22.0        | 2026-05-08    | ✅        |
| CLI Android  | 최신 버전   | React Native 0.85.3     | 2.22.0        | 2026-05-08    | ✅        |
| Expo iOS     | 최신 버전   | Expo SDK 54 / RN 0.81.5 | 2.22.0        | 2026-05-08    | ✅        |
| Expo Android | 최신 버전   | Expo SDK 54 / RN 0.81.5 | 2.22.0        | 2026-05-08    | ✅        |

## 라이선스

MIT
