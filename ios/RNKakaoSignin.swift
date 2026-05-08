import Foundation

import KakaoSDKCommon
import KakaoSDKAuth
import KakaoSDKUser

@objc(RNKakaoSignin)
class RNKakaoSignin: NSObject {
  private static var isConfigured = false
  private static let configurationQueue = DispatchQueue(label: "kr.packagekr.kakao.signin.configuration")

  // SDK 초기화
  override init() {
    super.init()
    Self.configureKakaoSdkIfNeeded()
  }

  @discardableResult
  private static func configureKakaoSdkIfNeeded() -> Bool {
    return configurationQueue.sync {
      if isConfigured {
        return true
      }

      guard let appKey = RNKakaoSigninHelper.resolveAppKey() else { return false }

      if let customScheme = RNKakaoSigninHelper.resolveCustomScheme(appKey: appKey) {
        KakaoSDK.initSDK(appKey: appKey, customScheme: customScheme)
      } else {
        KakaoSDK.initSDK(appKey: appKey)
      }

      isConfigured = true
      return true
    }
  }

  // 메인 큐 초기화
  @objc static func requiresMainQueueSetup() -> Bool { true }

  // 카카오톡 로그인 URL 확인
  @objc(isKakaoTalkLoginUrl:)
  static func isKakaoTalkLoginUrl(_ url: URL) -> Bool {
    guard let appKey = RNKakaoSigninHelper.resolveAppKey() else { return false }

    return RNKakaoSigninHelper.isKakaoOAuthRedirect(url, appKey: appKey)
  }

  // 카카오톡 로그인 URL 처리
  @objc(handleOpenUrl:)
  static func handleOpenUrl(_ url: URL) -> Bool {
    guard isKakaoTalkLoginUrl(url), configureKakaoSdkIfNeeded() else { return false }

    return AuthController.handleOpenUrl(url: url)
  }

  // 카카오 로그인
  @objc(login:reject:)
  func login(_ resolve: @escaping RCTPromiseResolveBlock,
             reject: @escaping RCTPromiseRejectBlock) {
    runConfiguredOnMain(reject) {
      let isKakaoTalkLoginAvailable = UserApi.isKakaoTalkLoginAvailable()

      if isKakaoTalkLoginAvailable {
        UserApi.shared.loginWithKakaoTalk { token, error in
          if let token = token {
            resolve(RNKakaoSigninHelper.tokenToDict(token))
            return
          }

          if let error = error {
            let parsedError = RNKakaoError.parse(error)

            if RNKakaoError.isTerminalLoginError(parsedError) {
              self.rejectParsed(reject, parsedError)
              return
            }

            if RNKakaoError.isConfigurationError(parsedError) {
              self.rejectParsed(reject, parsedError)
              return
            }

            UserApi.shared.loginWithKakaoAccount(completion: self.tokenHandler(resolve, reject))
            return
          }

          self.rejectParsed(reject, RNKakaoError.unknownLogin())
        }
        return
      }

      UserApi.shared.loginWithKakaoAccount(completion: self.tokenHandler(resolve, reject))
    }
  }

  // 카카오계정 로그인
  @objc(loginWithKakaoAccount:reject:)
  func loginWithKakaoAccount(_ resolve: @escaping RCTPromiseResolveBlock,
                             reject: @escaping RCTPromiseRejectBlock) {
    runConfiguredOnMain(reject) {
      UserApi.shared.loginWithKakaoAccount(completion: self.tokenHandler(resolve, reject))
    }
  }

  // 로그아웃
  @objc(logout:reject:)
  func logout(_ resolve: @escaping RCTPromiseResolveBlock,
              reject: @escaping RCTPromiseRejectBlock) {
    runConfiguredOnMain(reject) {
      UserApi.shared.logout(completion: self.unitHandler(resolve, reject))
    }
  }

  // 연결 끊기
  @objc(unlink:reject:)
  func unlink(_ resolve: @escaping RCTPromiseResolveBlock,
              reject: @escaping RCTPromiseRejectBlock) {
    runConfiguredOnMain(reject) {
      UserApi.shared.unlink(completion: self.unitHandler(resolve, reject))
    }
  }

  // 토큰 정보 조회
  @objc(getAccessToken:reject:)
  func getAccessToken(_ resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
    runConfiguredOnMain(reject) {
      guard let token = TokenManager.manager.getToken() else {
        resolve(nil)
        return
      }

      let expiresIn = max(0, token.expiredAt.timeIntervalSinceNow)
      resolve(RNKakaoSigninHelper.compact([
        "accessToken": token.accessToken,
        "expiresIn": expiresIn,
      ]))
    }
  }

  // 프로필 조회
  @objc(getProfile:reject:)
  func getProfile(_ resolve: @escaping RCTPromiseResolveBlock,
                  reject: @escaping RCTPromiseRejectBlock) {
    runConfiguredOnMain(reject) {
      UserApi.shared.me { user, error in
        if let error = error { self.reject(reject, error) }
        else if user == nil {
          self.rejectParsed(reject, RNKakaoError.profileNotFound())
        }
        else {
          resolve(self.profileToDict(user))
        }
      }
    }
  }

  // 배송지 조회
  @objc(shippingAddresses:reject:)
  func shippingAddresses(_ resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock) {
    runConfiguredOnMain(reject) {
      UserApi.shared.shippingAddresses { addresses, error in
        if let error = error { self.reject(reject, error) }
        else if addresses == nil {
          self.rejectParsed(reject, RNKakaoError.shippingAddressesNotFound())
        }
        else {
          resolve(self.shippingAddressesToDict(addresses))
        }
      }
    }
  }

  // 서비스 약관 조회
  @objc(serviceTerms:reject:)
  func serviceTerms(_ resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    runConfiguredOnMain(reject) {
      UserApi.shared.serviceTerms { terms, error in
        if let error = error { self.reject(reject, error) }
        else {
          resolve(self.serviceTermsToDict(terms))
        }
      }
    }
  }

  // 메인 스레드 실행
  private func runConfiguredOnMain(
    _ reject: @escaping RCTPromiseRejectBlock,
    _ action: @escaping () -> Void
  ) {
    DispatchQueue.main.async {
      guard Self.configureKakaoSdkIfNeeded() else {
        self.rejectParsed(reject, RNKakaoError.misconfigured())
        return
      }

      action()
    }
  }

  // 토큰 응답 콜백
  private func tokenHandler(
    _ resolve: @escaping RCTPromiseResolveBlock,
    _ reject: @escaping RCTPromiseRejectBlock
  ) -> (OAuthToken?, Error?) -> Void {
    return { token, error in
      if let error = error {
        let parsedError = RNKakaoError.parse(error)
        self.rejectParsed(reject, parsedError)
      }
      else if token == nil {
        self.rejectParsed(reject, RNKakaoError.unknownLogin())
      }
      else {
        resolve(RNKakaoSigninHelper.tokenToDict(token))
      }
    }
  }

  // 성공 응답 콜백
  private func unitHandler(
    _ resolve: @escaping RCTPromiseResolveBlock,
    _ reject: @escaping RCTPromiseRejectBlock
  ) -> (Error?) -> Void {
    return { error in
      if let error = error { self.reject(reject, error) }
      else { resolve(true) }
    }
  }

  // 프로필 응답 생성
  private func profileToDict(_ user: User?) -> [String: Any] {
    let account = user?.kakaoAccount
    let profile = account?.profile

    return RNKakaoSigninHelper.compact([
      "id": user?.id.map { String($0) } as Any,
      "name": account?.name as Any,
      "email": account?.email as Any,
      "nickname": profile?.nickname as Any,
      "profileImageUrl": profile?.profileImageUrl?.absoluteString as Any,
      "thumbnailImageUrl": profile?.thumbnailImageUrl?.absoluteString as Any,
      "phoneNumber": account?.phoneNumber as Any,
      "ageRange": account?.ageRange?.rawValue as Any,
      "birthday": account?.birthday as Any,
      "birthdayType": RNKakaoSigninHelper.normalizedEnumValue(account?.birthdayType?.rawValue) as Any,
      "birthyear": account?.birthyear as Any,
      "gender": account?.gender?.rawValue as Any,
      "isEmailValid": account?.isEmailValid as Any,
      "isEmailVerified": account?.isEmailVerified as Any,
      "isKorean": account?.isKorean as Any,
      "isDefaultImage": profile?.isDefaultImage as Any,
      "connectedAt": RNKakaoSigninHelper.formatDate(user?.connectedAt) as Any,
      "synchedAt": RNKakaoSigninHelper.formatDate(user?.synchedAt) as Any,
      "ci": account?.ci as Any,
      "ciAuthenticatedAt": RNKakaoSigninHelper.formatDate(account?.ciAuthenticatedAt) as Any,
      "legalName": account?.legalName as Any,
      "legalBirthDate": account?.legalBirthDate as Any,
      "legalGender": account?.legalGender?.rawValue as Any,
      "ageRangeNeedsAgreement": account?.ageRangeNeedsAgreement as Any,
      "birthdayNeedsAgreement": account?.birthdayNeedsAgreement as Any,
      "birthyearNeedsAgreement": account?.birthyearNeedsAgreement as Any,
      "emailNeedsAgreement": account?.emailNeedsAgreement as Any,
      "genderNeedsAgreement": account?.genderNeedsAgreement as Any,
      "isKoreanNeedsAgreement": account?.isKoreanNeedsAgreement as Any,
      "phoneNumberNeedsAgreement": account?.phoneNumberNeedsAgreement as Any,
      "profileNeedsAgreement": account?.profileNeedsAgreement as Any,
      "profileNicknameNeedsAgreement": account?.profileNicknameNeedsAgreement as Any,
      "profileImageNeedsAgreement": account?.profileImageNeedsAgreement as Any,
      "nameNeedsAgreement": account?.nameNeedsAgreement as Any,
      "ciNeedsAgreement": account?.ciNeedsAgreement as Any,
      "legalNameNeedsAgreement": account?.legalNameNeedsAgreement as Any,
      "legalBirthDateNeedsAgreement": account?.legalBirthDateNeedsAgreement as Any,
      "legalGenderNeedsAgreement": account?.legalGenderNeedsAgreement as Any,
    ])
  }

  // 배송지 응답 생성
  private func shippingAddressesToDict(_ addresses: UserShippingAddresses?) -> [String: Any] {
    var result = RNKakaoSigninHelper.compact([
      "userId": addresses?.userId.map { String($0) } as Any,
      "needsAgreement": addresses?.needsAgreement as Any,
    ])

    result["shippingAddresses"] = (addresses?.shippingAddresses ?? []).map(shippingAddressToDict)
    return result
  }

  private func shippingAddressToDict(_ address: ShippingAddress) -> [String: Any] {
    return RNKakaoSigninHelper.compact([
      "id": String(address.id),
      "name": address.name as Any,
      "isDefault": address.isDefault,
      "updatedAt": RNKakaoSigninHelper.formatDate(address.updatedAt) as Any,
      "type": RNKakaoSigninHelper.normalizedEnumValue(address.type?.rawValue) as Any,
      "baseAddress": address.baseAddress as Any,
      "detailAddress": address.detailAddress as Any,
      "receiverName": address.receiverName as Any,
      "receiverPhoneNumber1": address.receiverPhoneNumber1 as Any,
      "receiverPhoneNumber2": address.receiverPhoneNumber2 as Any,
      "zoneNumber": address.zoneNumber as Any,
      "zipCode": address.zipCode as Any,
    ])
  }

  // 서비스 약관 응답 생성
  private func serviceTermsToDict(_ terms: UserServiceTerms?) -> [String: Any] {
    return RNKakaoSigninHelper.compact([
      "userId": terms.map { String($0.id) } as Any,
      "serviceTerms": (terms?.serviceTerms ?? []).map(serviceTermToDict),
    ])
  }

  private func serviceTermToDict(_ term: ServiceTerms) -> [String: Any] {
    return RNKakaoSigninHelper.compact([
      "tag": term.tag,
      "agreed": term.agreed,
      "required": term.required,
      "revocable": term.revocable,
      "agreedAt": RNKakaoSigninHelper.formatDate(term.agreedAt) as Any,
    ])
  }

  // 에러 변환
  private func reject(_ reject: RCTPromiseRejectBlock, _ error: Error) {
    rejectParsed(reject, RNKakaoError.parse(error))
  }

  private func rejectParsed(_ reject: RCTPromiseRejectBlock, _ error: RNKakaoError.ParsedError) {
    var userInfo: [String: Any] = [NSLocalizedDescriptionKey: error.message]

    if let sdkMessage = error.sdkMessage {
      userInfo["sdkMessage"] = sdkMessage
    }

    let nativeError = NSError(domain: "RNKakaoSignin", code: 0, userInfo: userInfo)
    reject(error.code, error.message, nativeError)
  }
}
