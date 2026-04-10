import Foundation

import KakaoSDKCommon
import KakaoSDKAuth
import KakaoSDKUser

@objc(RNKakaoLogin)
class RNKakaoLogin: NSObject {

  public override init() {
    let appKey = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_KEY") as? String
    let customScheme = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_SCHEME") as? String

    if let appKey = appKey {
      if let customScheme = customScheme {
        KakaoSDK.initSDK(appKey: appKey, customScheme: customScheme)
      } else {
        KakaoSDK.initSDK(appKey: appKey)
      }
    }

    super.init()
  }

  @objc static func requiresMainQueueSetup() -> Bool { true }

  // MARK: - 로그인

  @objc(login:rejecter:)
  func login(_ resolve: @escaping RCTPromiseResolveBlock,
             rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let handler: (OAuthToken?, Error?) -> Void = { token, error in
        if let error = error { self.reject(reject, error) }
        else { resolve(RNKakaoLoginHelper.tokenToDict(token)) }
      }

      if UserApi.isKakaoTalkLoginAvailable() {
        UserApi.shared.loginWithKakaoTalk(completion: handler)
      } else {
        UserApi.shared.loginWithKakaoAccount(completion: handler)
      }
    }
  }

  @objc(loginWithKakaoAccount:rejecter:)
  func loginWithKakaoAccount(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UserApi.shared.loginWithKakaoAccount { token, error in
        if let error = error { self.reject(reject, error) }
        else { resolve(RNKakaoLoginHelper.tokenToDict(token)) }
      }
    }
  }

  // MARK: - 로그아웃 / 연결 끊기

  @objc(logout:rejecter:)
  func logout(_ resolve: @escaping RCTPromiseResolveBlock,
              rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UserApi.shared.logout { error in
        if let error = error { self.reject(reject, error) }
        else { resolve("Successfully logged out") }
      }
    }
  }

  @objc(unlink:rejecter:)
  func unlink(_ resolve: @escaping RCTPromiseResolveBlock,
              rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UserApi.shared.unlink { error in
        if let error = error { self.reject(reject, error) }
        else { resolve("Successfully unlinked") }
      }
    }
  }

  // MARK: - 토큰 정보

  @objc(getAccessToken:rejecter:)
  func getAccessToken(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
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

  // MARK: - 프로필

  @objc(getProfile:rejecter:)
  func getProfile(_ resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
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

  // MARK: - 배송지

  @objc(shippingAddresses:rejecter:)
  func shippingAddresses(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
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

  // MARK: - 서비스 약관

  @objc(serviceTerms:rejecter:)
  func serviceTerms(_ resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
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

  // MARK: - Private

  private func reject(_ reject: RCTPromiseRejectBlock, _ error: Error) {
    let (code, message) = RNKakaoError.parse(error)
    reject(code, message, error)
  }
}
