import Foundation

import KakaoSDKCommon
import KakaoSDKAuth
import KakaoSDKUser

@objc(RNKakaoLogin)
class RNKakaoLogin: NSObject {

  // SDK 초기화
  public override init() {
    let appKey = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_KEY") as? String
    let customScheme = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_SCHEME") as? String

    RNKakaoLogin.configureSDK(appKey: appKey, customScheme: customScheme)

    super.init()
  }

  // 메인 큐 초기화
  @objc static func requiresMainQueueSetup() -> Bool { true }

  // 카카오톡 로그인 URL 확인
  @objc(isKakaoTalkLoginUrl:)
  static func isKakaoTalkLoginUrl(_ url: URL) -> Bool {
    return AuthApi.isKakaoTalkLoginUrl(url)
  }

  // 카카오톡 로그인 URL 처리
  @objc(handleOpenUrl:)
  static func handleOpenUrl(_ url: URL) -> Bool {
    return AuthController.handleOpenUrl(url: url)
  }

  // 카카오 로그인
  @objc(login:rejecter:)
  func login(_ resolve: @escaping RCTPromiseResolveBlock,
             rejecter reject: @escaping RCTPromiseRejectBlock) {
    runOnMain {
      let completion = self.tokenHandler(resolve, reject)

      if UserApi.isKakaoTalkLoginAvailable() {
        UserApi.shared.loginWithKakaoTalk(completion: completion)
        return
      }

      UserApi.shared.loginWithKakaoAccount(completion: completion)
    }
  }

  // 카카오계정 로그인
  @objc(loginWithKakaoAccount:rejecter:)
  func loginWithKakaoAccount(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
    runOnMain { UserApi.shared.loginWithKakaoAccount(completion: self.tokenHandler(resolve, reject)) }
  }

  // 세션 처리

  // 로그아웃
  @objc(logout:rejecter:)
  func logout(_ resolve: @escaping RCTPromiseResolveBlock,
              rejecter reject: @escaping RCTPromiseRejectBlock) {
    runOnMain { UserApi.shared.logout(completion: self.messageHandler(resolve, reject, "Successfully logged out")) }
  }

  // 연결 끊기
  @objc(unlink:rejecter:)
  func unlink(_ resolve: @escaping RCTPromiseResolveBlock,
              rejecter reject: @escaping RCTPromiseRejectBlock) {
    runOnMain { UserApi.shared.unlink(completion: self.messageHandler(resolve, reject, "Successfully unlinked")) }
  }

  // 토큰 정보 조회
  @objc(getAccessToken:rejecter:)
  func getAccessToken(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    runOnMain {
      UserApi.shared.accessTokenInfo { info, error in
        if let error = error { self.reject(reject, error) }
        else {
          resolve([
            "accessToken": TokenManager.manager.getToken()?.accessToken as Any,
            "expiresIn": info?.expiresIn as Any,
          ])
        }
      }
    }
  }

  // 프로필 조회
  @objc(getProfile:rejecter:)
  func getProfile(_ resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    runOnMain {
      UserApi.shared.me { user, error in
        if let error = error { self.reject(reject, error) }
        else {
          let account = user?.kakaoAccount
          let profile = account?.profile
          resolve([
            "id": user?.id as Any,
            "name": account?.name as Any,
            "email": account?.email as Any,
            "nickname": profile?.nickname as Any,
            "profileImageUrl": profile?.profileImageUrl?.absoluteString as Any,
            "thumbnailImageUrl": profile?.thumbnailImageUrl?.absoluteString as Any,
            "phoneNumber": account?.phoneNumber as Any,
            "ageRange": account?.ageRange?.rawValue as Any,
            "birthday": account?.birthday as Any,
            "birthdayType": account?.birthdayType as Any,
            "birthyear": account?.birthyear as Any,
            "gender": account?.gender?.rawValue as Any,
            "isEmailValid": account?.isEmailValid as Any,
            "isEmailVerified": account?.isEmailVerified as Any,
            "isKorean": account?.isKorean as Any,
            "ageRangeNeedsAgreement": account?.ageRangeNeedsAgreement as Any,
            "birthdayNeedsAgreement": account?.birthdayNeedsAgreement as Any,
            "birthyearNeedsAgreement": account?.birthyearNeedsAgreement as Any,
            "emailNeedsAgreement": account?.emailNeedsAgreement as Any,
            "genderNeedsAgreement": account?.genderNeedsAgreement as Any,
            "isKoreanNeedsAgreement": account?.isKoreanNeedsAgreement as Any,
            "phoneNumberNeedsAgreement": account?.phoneNumberNeedsAgreement as Any,
            "profileNeedsAgreement": account?.profileNeedsAgreement as Any,
          ])
        }
      }
    }
  }

  // 배송지 조회
  @objc(shippingAddresses:rejecter:)
  func shippingAddresses(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
    runOnMain {
      let fmt = RNKakaoLoginHelper.dateFormatter
      UserApi.shared.shippingAddresses { addresses, error in
        if let error = error { self.reject(reject, error) }
        else {
          resolve([
            "userId": addresses?.userId as Any,
            "needsAgreement": addresses?.needsAgreement as Any,
            "shippingAddresses": addresses?.shippingAddresses?.map { addr in [
              "id": addr.id as Any,
              "name": addr.name as Any,
              "isDefault": addr.isDefault as Any,
              "updatedAt": fmt.string(from: addr.updatedAt!) as Any,
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
    runOnMain {
      let fmt = RNKakaoLoginHelper.dateFormatter
      UserApi.shared.serviceTerms { terms, error in
        if let error = error { self.reject(reject, error) }
        else {
          var result: [String: Any] = [:]
          if let userId = terms?.id { result["userId"] = userId }
          if let serviceTerms = terms?.serviceTerms {
            result["serviceTerms"] = serviceTerms.map { term -> [String: Any] in
              var dict: [String: Any] = [
                "tag": term.tag,
                "agreed": term.agreed,
                "required": term.required,
                "revocable": term.revocable,
              ]
              if let agreedAt = term.agreedAt {
                dict["agreedAt"] = fmt.string(from: agreedAt)
              }
              return dict
            }
          }
          resolve(result)
        }
      }
    }
  }

  // SDK 설정
  private static func configureSDK(appKey: String?, customScheme: String?) {
    guard let appKey = appKey else { return }

    if let customScheme = customScheme {
      KakaoSDK.initSDK(appKey: appKey, customScheme: customScheme)
      return
    }

    KakaoSDK.initSDK(appKey: appKey)
  }

  // 메인 스레드 실행
  private func runOnMain(_ action: @escaping () -> Void) {
    DispatchQueue.main.async(execute: action)
  }

  // 토큰 응답 콜백
  private func tokenHandler(
    _ resolve: @escaping RCTPromiseResolveBlock,
    _ reject: @escaping RCTPromiseRejectBlock
  ) -> (OAuthToken?, Error?) -> Void {
    return { token, error in
      if let error = error { self.reject(reject, error) }
      else { resolve(RNKakaoLoginHelper.tokenToDict(token)) }
    }
  }

  // 메시지 응답 콜백
  private func messageHandler(
    _ resolve: @escaping RCTPromiseResolveBlock,
    _ reject: @escaping RCTPromiseRejectBlock,
    _ message: String
  ) -> (Error?) -> Void {
    return { error in
      if let error = error { self.reject(reject, error) }
      else { resolve(message) }
    }
  }

  // 에러 변환
  private func reject(_ reject: RCTPromiseRejectBlock, _ error: Error) {
    let (code, message) = RNKakaoError.parse(error)
    reject(code, message, error)
  }
}
