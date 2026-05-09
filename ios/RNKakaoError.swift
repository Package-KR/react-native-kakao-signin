import Foundation
import KakaoSDKAuth
import KakaoSDKCommon
import KakaoSDKUser

enum RNKakaoError {
  typealias ParsedError = (code: String, message: String, sdkMessage: String?)

  // 에러 코드
  private enum Code {
    static let accessDenied = "KAKAO_ACCESS_DENIED"
    static let apiError = "KAKAO_API_ERROR"
    static let authError = "KAKAO_AUTH_ERROR"
    static let badParameter = "KAKAO_BAD_PARAMETER"
    static let cancelled = "KAKAO_CANCELLED"
    static let clientError = "KAKAO_CLIENT_ERROR"
    static let defaultError = "KAKAO_ERROR"
    static let forbidden = "KAKAO_FORBIDDEN"
    static let illegalState = "KAKAO_ILLEGAL_STATE"
    static let invalidAppKey = "KAKAO_INVALID_APP_KEY"
    static let invalidBundleId = "KAKAO_INVALID_BUNDLE_ID"
    static let invalidClient = "KAKAO_INVALID_CLIENT"
    static let invalidGrant = "KAKAO_INVALID_GRANT"
    static let invalidRequest = "KAKAO_INVALID_REQUEST"
    static let invalidScope = "KAKAO_INVALID_SCOPE"
    static let invalidUrlScheme = "KAKAO_INVALID_URL_SCHEME"
    static let loginRequired = "KAKAO_LOGIN_REQUIRED"
    static let misconfigured = "KAKAO_MISCONFIGURED"
    static let notSupported = "KAKAO_NOT_SUPPORTED"
    static let profileNotFound = "KAKAO_PROFILE_NOT_FOUND"
    static let rateLimit = "KAKAO_RATE_LIMIT"
    static let serverError = "KAKAO_SERVER_ERROR"
    static let shippingAddressesNotFound = "KAKAO_SHIPPING_ADDRESSES_NOT_FOUND"
    static let tokenExpired = "KAKAO_TOKEN_EXPIRED"
    static let tokenNotFound = "KAKAO_TOKEN_NOT_FOUND"
    static let unknownError = "KAKAO_UNKNOWN_ERROR"
  }

  // 에러 메시지
  private enum Message {
    static let accessDenied = "Kakao login was cancelled or access was denied."
    static let apiError = "A Kakao API error occurred."
    static let authError = "A Kakao authentication error occurred."
    static let badParameter = "Invalid parameter."
    static let cancelled = "Login was cancelled."
    static let clientError = "A Kakao client error occurred."
    static let defaultError = "An error occurred while processing the Kakao request."
    static let forbidden = "Permission is required. Please check the consent items."
    static let illegalState = "Invalid state."
    static let invalidAppKey = "The Kakao native app key is invalid. Please check your Kakao app key configuration."
    static let invalidBundleId = "The iOS bundle ID is invalid. Please check the iOS bundle ID in Kakao Developers and your Xcode settings."
    static let invalidClient = "The Kakao iOS app configuration is invalid. Please check the app key, bundle ID, URL scheme, and platform settings."
    static let invalidGrant = "The authorization information is invalid. Please sign in again."
    static let invalidRequest = "The Kakao login request is invalid. Please check your iOS app configuration and request parameters."
    static let invalidScope = "The requested scope is invalid. Please check the requested consent items and Kakao Developers settings."
    static let invalidUrlScheme = "The iOS URL scheme is invalid. Please check CFBundleURLTypes, KAKAO_APP_SCHEME, and Kakao Developers settings."
    static let loginRequired = "Kakao login authorization is required. Please check app permissions and platform settings."
    static let misconfigured = "The Kakao iOS configuration is invalid. Please check the bundle ID, URL scheme, KAKAO_APP_KEY, and Kakao Developers settings."
    static let notSupported = "This feature is not supported."
    static let profileNotFound = "Kakao profile information could not be found."
    static let rateLimit = "Too many requests. Please try again later."
    static let serverError = "A Kakao server error occurred. Please try again later."
    static let shippingAddressesNotFound = "Kakao shipping address information could not be found."
    static let tokenExpired = "Authentication has expired. Please sign in again."
    static let tokenNotFound = "Sign-in is required."
    static let unknownLogin = "Kakao login failed."
  }

  // 프로필 없음
  static func profileNotFound() -> ParsedError {
    return make(Code.profileNotFound, Message.profileNotFound)
  }

  // 배송지 없음
  static func shippingAddressesNotFound() -> ParsedError {
    return make(Code.shippingAddressesNotFound, Message.shippingAddressesNotFound)
  }

  // 로그인 실패
  static func unknownLogin() -> ParsedError {
    return make(Code.unknownError, Message.unknownLogin)
  }

  // 설정 누락
  static func misconfigured() -> ParsedError {
    return make(Code.misconfigured, Message.misconfigured)
  }

  // SDK 에러 변환
  static func parse(_ error: Error) -> ParsedError {
    let sdkMessage = resolveSdkMessage(error)

    if let sdkError = error as? SdkError {
      switch sdkError {
      case .ClientFailed(let reason, _):
        return resolveClientError(reason, sdkMessage)
      case .ApiFailed(let reason, _):
        return resolveApiError(reason, sdkMessage)
      case .AuthFailed(let reason, _):
        return resolveAuthError(reason, sdkMessage)
      case .AppsFailed(_, _):
        return make(Code.apiError, Message.apiError, sdkMessage)
      }
    }

    return make(Code.defaultError, Message.defaultError, sdkMessage)
  }

  static func shouldFallbackToKakaoAccount(_ error: ParsedError) -> Bool {
    return !fallbackCodes.contains(error.code)
  }

  private typealias ErrorSpec = (code: String, message: String)

  private static let fallbackCodes = [
    Code.cancelled,
    Code.accessDenied,
    Code.invalidAppKey,
    Code.invalidBundleId,
    Code.invalidClient,
    Code.invalidUrlScheme,
    Code.misconfigured,
  ]

  // 클라이언트 에러 변환
  private static func resolveClientError(_ reason: ClientFailureReason, _ sdkMessage: String?) -> ParsedError {
    let spec: ErrorSpec = switch reason {
    case .Cancelled:
      (Code.cancelled, Message.cancelled)
    case .TokenNotFound:
      (Code.tokenNotFound, Message.tokenNotFound)
    case .NotSupported:
      (Code.notSupported, Message.notSupported)
    case .BadParameter:
      (Code.badParameter, Message.badParameter)
    case .IllegalState:
      (Code.illegalState, Message.illegalState)
    default:
      (Code.clientError, Message.clientError)
    }

    return make(spec.code, spec.message, sdkMessage)
  }

  // API 에러 변환
  private static func resolveApiError(_ reason: ApiFailureReason, _ sdkMessage: String?) -> ParsedError {
    let spec: ErrorSpec = switch reason {
    case .InvalidAccessToken:
      (Code.tokenExpired, Message.tokenExpired)
    case .Blocked, .Permission, .InsufficientScope, .RequiredAgeVerification, .UnderAgeLimit, .LowerAgeLimit:
      (Code.forbidden, Message.forbidden)
    case .ApiLimitExceed, .TalkSendMessageMonthlyLimitExceed, .TalkSendMessageDailyLimitExceed, .AgeCheckLimitExceed:
      (Code.rateLimit, Message.rateLimit)
    case .BadParameter:
      (Code.badParameter, Message.badParameter)
    case .UnsupportedApi, .DeprecatedApi:
      (Code.notSupported, Message.notSupported)
    case .Internal, .ServerTimeout, .UnderMaintenance:
      (Code.serverError, Message.serverError)
    case .NoSuchApp:
      (Code.invalidAppKey, Message.invalidAppKey)
    default:
      (Code.apiError, Message.apiError)
    }

    return make(spec.code, spec.message, sdkMessage)
  }

  // 인증 에러 변환
  private static func resolveAuthError(_ reason: AuthFailureReason, _ sdkMessage: String?) -> ParsedError {
    if reason == .InvalidClient {
      return resolveAuthConfigurationError(sdkMessage)
    }

    if reason == .InvalidRequest {
      return resolveInvalidRequest(sdkMessage)
    }

    let spec: ErrorSpec = switch reason {
    case .InvalidGrant:
      (Code.invalidGrant, Message.invalidGrant)
    case .InvalidScope:
      (Code.invalidScope, Message.invalidScope)
    case .Misconfigured:
      (Code.misconfigured, Message.misconfigured)
    case .Unauthorized:
      (Code.loginRequired, Message.loginRequired)
    case .AccessDenied:
      (Code.accessDenied, Message.accessDenied)
    case .ServerError:
      (Code.serverError, Message.serverError)
    default:
      (Code.authError, Message.authError)
    }

    return make(spec.code, spec.message, sdkMessage)
  }

  // 인증 설정 에러 변환
  private static func resolveAuthConfigurationError(_ sdkMessage: String?) -> ParsedError {
    let lowercased = sdkMessage?.lowercased() ?? ""

    if lowercased.contains("app key") || lowercased.contains("client_id") || lowercased.contains("invalid_client") {
      return make(Code.invalidAppKey, Message.invalidAppKey, sdkMessage)
    }

    if lowercased.contains("bundle") {
      return make(Code.invalidBundleId, Message.invalidBundleId, sdkMessage)
    }

    if lowercased.contains("scheme") || lowercased.contains("redirect") {
      return make(Code.invalidUrlScheme, Message.invalidUrlScheme, sdkMessage)
    }

    return make(Code.invalidClient, Message.invalidClient, sdkMessage)
  }

  // 잘못된 요청 에러 변환
  private static func resolveInvalidRequest(_ sdkMessage: String?) -> ParsedError {
    let lowercased = sdkMessage?.lowercased() ?? ""

    if lowercased.contains("scheme") || lowercased.contains("redirect_uri") {
      return make(Code.invalidUrlScheme, Message.invalidUrlScheme, sdkMessage)
    }

    return make(Code.invalidRequest, Message.invalidRequest, sdkMessage)
  }

  // SDK 원문 메시지 추출
  private static func resolveSdkMessage(_ error: Error) -> String? {
    let message = error.localizedDescription.trimmingCharacters(in: .whitespacesAndNewlines)
    return message.isEmpty ? nil : message
  }

  // 에러 생성
  private static func make(_ code: String, _ message: String, _ sdkMessage: String? = nil) -> ParsedError {
    return (code: code, message: message, sdkMessage: sdkMessage)
  }
}
