import Foundation

import KakaoSDKCommon
import KakaoSDKAuth
import KakaoSDKUser

@objc(RNKakaoLogin)
class RNKakaoLogin: NSObject {

  public override init() {
    let appKey: String? = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_KEY") as? String
    let customScheme: String? = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_SCHEME") as? String
    if customScheme != nil {
      KakaoSDK.initSDK(appKey: appKey!, customScheme: customScheme!)
    } else {
      KakaoSDK.initSDK(appKey: appKey!)
    }
  }

  // 에러 해석
  private func rejectWithError(_ reject: RCTPromiseRejectBlock, _ error: Error) {
    let (code, message) = RNKakaoError.parse(error)
    reject(code, message, error)
  }

  // 메인 스레드 초기화
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  // 카카오톡 로그인 URL 여부 확인
  @objc(isKakaoTalkLoginUrl:)
  public static func isKakaoTalkLoginUrl(url: URL) -> Bool {
    let appKey = try? KakaoSDK.shared.appKey()
    if appKey != nil {
      return AuthApi.isKakaoTalkLoginUrl(url)
    }
    return false
  }

  // 카카오톡 딥링크 URL 처리
  @objc(handleOpenUrl:)
  public static func handleOpenUrl(url: URL) -> Bool {
    return AuthController.handleOpenUrl(url: url)
  }

  // 카카오 로그인
  @objc(login:rejecter:)
  func login(_ resolve: @escaping RCTPromiseResolveBlock,
             rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
      if UserApi.isKakaoTalkLoginAvailable() {
        UserApi.shared.loginWithKakaoTalk { (oauthToken, error) in
          if let error = error {
            self.rejectWithError(reject, error)
          } else {
            resolve([
              "accessToken": oauthToken?.accessToken ?? "",
              "refreshToken": oauthToken?.refreshToken ?? "",
              "idToken": oauthToken?.idToken ?? "",
              "accessTokenExpiresAt": dateFormatter.string(from: oauthToken!.expiredAt),
              "refreshTokenExpiresAt": dateFormatter.string(from: oauthToken!.refreshTokenExpiredAt),
              "scopes": oauthToken?.scopes ?? "",
            ])
          }
        }
      } else {
        UserApi.shared.loginWithKakaoAccount { (oauthToken, error) in
          if let error = error {
            self.rejectWithError(reject, error)
          } else {
            resolve([
              "accessToken": oauthToken?.accessToken ?? "",
              "refreshToken": oauthToken?.refreshToken ?? "",
              "idToken": oauthToken?.idToken ?? "",
              "accessTokenExpiresAt": dateFormatter.string(from: oauthToken!.expiredAt),
              "refreshTokenExpiresAt": dateFormatter.string(from: oauthToken!.refreshTokenExpiredAt),
              "scopes": oauthToken?.scopes ?? "",
            ])
          }
        }
      }
    }
  }

  // 카카오계정으로 로그인
  @objc(loginWithKakaoAccount:rejecter:)
  func loginWithKakaoAccount(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
      UserApi.shared.loginWithKakaoAccount { (oauthToken, error) in
        if let error = error {
          self.rejectWithError(reject, error)
        } else {
          resolve([
            "accessToken": oauthToken?.accessToken ?? "",
            "refreshToken": oauthToken?.refreshToken ?? "",
            "idToken": oauthToken?.idToken ?? "",
            "accessTokenExpiresAt": dateFormatter.string(from: oauthToken!.expiredAt),
            "refreshTokenExpiresAt": dateFormatter.string(from: oauthToken!.refreshTokenExpiredAt),
            "scopes": oauthToken?.scopes ?? "",
          ])
        }
      }
    }
  }

  // 로그아웃
  @objc(logout:rejecter:)
  func logout(_ resolve: @escaping RCTPromiseResolveBlock,
              rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UserApi.shared.logout { (error) in
        if let error = error { self.rejectWithError(reject, error) }
        else { resolve("Successfully logged out") }
      }
    }
  }

  // 연결 끊기
  @objc(unlink:rejecter:)
  func unlink(_ resolve: @escaping RCTPromiseResolveBlock,
              rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UserApi.shared.unlink { (error) in
        if let error = error { self.rejectWithError(reject, error) }
        else { resolve("Successfully unlinked") }
      }
    }
  }

  // 토큰 정보 조회
  @objc(getAccessToken:rejecter:)
  func getAccessToken(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UserApi.shared.accessTokenInfo { (accessTokenInfo, error) in
        if let error = error {
          self.rejectWithError(reject, error)
        } else {
          resolve([
            "accessToken": TokenManager.manager.getToken()?.accessToken as Any,
            "expiresIn": accessTokenInfo?.expiresIn as Any,
          ])
        }
      }
    }
  }

  // 프로필 조회
  @objc(getProfile:rejecter:)
  func getProfile(_ resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UserApi.shared.me() { (user, error) in
        if let error = error {
          self.rejectWithError(reject, error)
        } else {
          resolve([
            "id": user?.id as Any,
            "name": user?.kakaoAccount?.name as Any,
            "email": user?.kakaoAccount?.email as Any,
            "nickname": user?.kakaoAccount?.profile?.nickname as Any,
            "profileImageUrl": user?.kakaoAccount?.profile?.profileImageUrl?.absoluteString as Any,
            "thumbnailImageUrl": user?.kakaoAccount?.profile?.thumbnailImageUrl?.absoluteString as Any,
            "phoneNumber": user?.kakaoAccount?.phoneNumber as Any,
            "ageRange": user?.kakaoAccount?.ageRange?.rawValue as Any,
            "birthday": user?.kakaoAccount?.birthday as Any,
            "birthdayType": user?.kakaoAccount?.birthdayType as Any,
            "birthyear": user?.kakaoAccount?.birthyear as Any,
            "gender": user?.kakaoAccount?.gender?.rawValue as Any,
            "isEmailValid": user?.kakaoAccount?.isEmailValid as Any,
            "isEmailVerified": user?.kakaoAccount?.isEmailVerified as Any,
            "isKorean": user?.kakaoAccount?.isKorean as Any,
            "ageRangeNeedsAgreement": user?.kakaoAccount?.ageRangeNeedsAgreement as Any,
            "birthdayNeedsAgreement": user?.kakaoAccount?.birthdayNeedsAgreement as Any,
            "birthyearNeedsAgreement": user?.kakaoAccount?.birthyearNeedsAgreement as Any,
            "emailNeedsAgreement": user?.kakaoAccount?.emailNeedsAgreement as Any,
            "genderNeedsAgreement": user?.kakaoAccount?.genderNeedsAgreement as Any,
            "isKoreanNeedsAgreement": user?.kakaoAccount?.isKoreanNeedsAgreement as Any,
            "phoneNumberNeedsAgreement": user?.kakaoAccount?.phoneNumberNeedsAgreement as Any,
            "profileNeedsAgreement": user?.kakaoAccount?.profileNeedsAgreement as Any,
          ])
        }
      }
    }
  }

  // 배송지 조회
  @objc(shippingAddresses:rejecter:)
  func shippingAddresses(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
      UserApi.shared.shippingAddresses { (shippingAddresses, error) in
        if let error = error {
          self.rejectWithError(reject, error)
        } else {
          resolve([
            "userId": shippingAddresses?.userId as Any,
            "needsAgreement": shippingAddresses?.needsAgreement as Any,
            "shippingAddresses": shippingAddresses?.shippingAddresses?.map { addr in [
              "id": addr.id as Any,
              "name": addr.name as Any,
              "isDefault": addr.isDefault as Any,
              "updatedAt": dateFormatter.string(from: addr.updatedAt!) as Any,
              "type": addr.type?.rawValue as Any,
              "baseAddress": addr.baseAddress as Any,
              "detailAddress": addr.detailAddress as Any,
              "receiverName": addr.receiverName as Any,
              "receiverPhoneNumber1": addr.receiverPhoneNumber1 as Any,
              "receiverPhoneNumber2": addr.receiverPhoneNumber2 as Any,
              "zoneNumber": addr.zoneNumber as Any,
              "zipCode": addr.zipCode as Any,
            ]} as Any,
          ])
        }
      }
    }
  }

  // 서비스 약관 조회
  @objc(serviceTerms:rejecter:)
  func serviceTerms(_ resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UserApi.shared.serviceTerms { (userServiceTerms, error) in
        if let error = error {
          self.rejectWithError(reject, error)
        } else {
          let dateFormatter = DateFormatter()
          dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
          var result: [String: Any] = [:]
          if let userId = userServiceTerms?.id { result["userId"] = userId }
          if let serviceTerms = userServiceTerms?.serviceTerms {
            result["serviceTerms"] = serviceTerms.map { term -> [String: Any] in
              var dict: [String: Any] = [
                "tag": term.tag,
                "agreed": term.agreed,
                "required": term.required,
                "revocable": term.revocable,
              ]
              if let agreedAt = term.agreedAt { dict["agreedAt"] = dateFormatter.string(from: agreedAt) }
              return dict
            }
          }
          resolve(result)
        }
      }
    }
  }
}
