<div align="center">

# 카카오 개발자 콘솔 설정 가이드

카카오 로그인을 사용하려면 [카카오 개발자 콘솔](https://developers.kakao.com)에서 앱을 등록하고 설정해야 합니다.
이 문서는 콘솔 설정 전 과정을 단계별로 안내합니다.

</div>

## 애플리케이션 등록

1. [카카오 개발자 콘솔](https://developers.kakao.com)에 접속 후 로그인합니다.
2. 상단 메뉴에서 **앱**을 클릭합니다.
3. **앱 생성** 버튼을 클릭합니다.
4. **앱 이름**, **회사명**을 입력하고 저장합니다.
5. 생성된 앱을 클릭하면 **앱 설정 대시보드** 페이지로 이동합니다.
6. `왼쪽 사이드 바 > 앱 > 플랫폼 키`로 이동 후 **네이티브 앱 키**를 확인합니다.

> [!NOTE]
> 네이티브 앱 키가 [README](../README.md)의 `{KAKAO_APP_KEY}`에 들어갈 값입니다.

![애플리케이션 추가](images//01-add-app.png)

## Android 플랫폼 등록

![애플리케이션 추가](images//04-android-platform.png)

### 1. 패키지명 입력

`android/app/build.gradle` 에서 확인한 패키지명을 카카오 앱 설정에 등록합니다.

```groovy
// android/app/build.gradle
android {
    namespace = "kr.packagekr.kakao.signin"  // 패키지명
    defaultConfig {
        applicationId = "kr.packagekr.kakao.signin" // 패키지명
    }
}
```

### 2. 키 해시 입력

React Native `0.60.x` 부터는 프로젝트 생성 시 기본적으로 디버그 키스토어가 포함되어 있습니다.

키 해시는 인증서의 지문 값을 해시한 것으로, 카카오 API 서버가 요청이 허용된 앱에서 온 것인지 검증하는 데 사용됩니다.<br/>
터미널에서 아래 명령어를 실행하여 현재 사용자 환경의 키 해시를 추출한 뒤, 카카오 콘솔의 **키 해시** 항목에 등록합니다.

#### 디버그 키 해시 (개발용)

`debug.keystore`는 Android 프로젝트를 처음 빌드할 때 `~/.android/debug.keystore` 경로에 자동으로 생성됩니다.<br/>
아직 빌드를 한 번도 하지 않았다면 `npx react-native run-android`를 먼저 실행해 주세요.

```sh
# macOS / Linux
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64

# Windows
keytool -exportcert -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64
```

#### 릴리즈 키 해시 (배포용)

`{KEY_ALIAS}`와 `{KEYSTORE_PATH}`를 직접 생성한 릴리즈 키스토어의 alias와 절대 경로로 교체합니다.

```sh
# macOS / Linux
keytool -exportcert -alias {KEY_ALIAS} -keystore {KEYSTORE_PATH} | openssl sha1 -binary | openssl base64

# Windows
keytool -exportcert -alias {KEY_ALIAS} -keystore {KEYSTORE_PATH} | PATH_TO_OPENSSL_LIBRARY\bin\openssl base64
```

> [!NOTE]
> 개발 중에는 디버그 키 해시를, 스토어 배포 시에는 릴리즈 키 해시를 등록해야 합니다.<br/><br/>
> 두 키 해시를 모두 등록하면 개발과 배포 환경 모두에서 사용할 수 있으며<br/>
> 여러 개발자가 참여하는 프로젝트의 경우, 각 개발자의 디버그 키 해시를 **모두** 등록해야 합니다.

### 3. 저장을 해줍니다.

## iOS 플랫폼 등록

### 1. 번들 ID 확인 및 복사

Xcode 프로젝트의 `Project/ios > TARGETS > Signing & Capabilities > Bundle Identifier` 에서 Bundle Id를 확인 및 복사를 해주세요.

### 2. 번들 ID 입력

복사하신 번들 ID를 카카오 앱 설정에 등록합니다.

![애플리케이션 추가](images//02-ios-platform.png)
![애플리케이션 추가](images//03-ios-platform.png)

## 카카오 로그인 활성화

1. 앱 대시보드 좌측 메뉴에서 **제품 설정 > 카카오 로그인**으로 이동합니다.
2. **카카오 로그인 활성화** 토글을 **ON**으로 설정합니다.

![애플리케이션 추가](images//05-login-on.png)

> [!WARNING]
> 활성화하지 않으면 로그인 시도 시 오류가 발생합니다.

## 동의항목 설정

1. 앱 대시보드 좌측 메뉴에서 **제품 설정 > 카카오 로그인 > 동의항목**으로 이동합니다.
2. 앱에서 수집할 항목을 설정합니다.

![동의항목 설정](images//06-consent-list.png)

설정이 완료되면 [README](../README.md)로 돌아가 네이티브 설정을 이어서 진행하세요.
