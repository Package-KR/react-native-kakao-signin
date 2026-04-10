import Foundation

import KakaoSDKCommon
import KakaoSDKAuth

enum RNKakaoError {
  // 로그인 에러 메시지 보정
  private static func resolveAuthMessage(
    _ reason: AuthFailureReason,
    _ authErrorInfo: AuthErrorInfo?,
    _ fallback: String
  ) -> (code: String, message: String) {
    let description = authErrorInfo?.errorDescription?.trimmingCharacters(in: .whitespacesAndNewlines)
    let normalizedDescription = description?.lowercased() ?? ""

    switch reason {
    case .InvalidRequest:
      if normalizedDescription.contains("bundle") {
        return ("KAKAO_INVALID_BUNDLE_ID", "iOS 번들 ID 설정이 올바르지 않습니다. Kakao 콘솔의 iOS 번들 ID와 Xcode 설정을 확인해주세요.")
      }
      if normalizedDescription.contains("scheme") || normalizedDescription.contains("redirect") {
        return ("KAKAO_INVALID_URL_SCHEME", "iOS URL scheme 설정이 올바르지 않습니다. Info.plist의 URL Types, KAKAO_APP_SCHEME, Kakao 콘솔 설정을 확인해주세요.")
      }
      if normalizedDescription.contains("client") || normalizedDescription.contains("app key") {
        return ("KAKAO_INVALID_APP_KEY", "KAKAO_APP_KEY 값이 올바르지 않습니다. Kakao 네이티브 앱 키와 Info.plist 설정을 확인해주세요.")
      }
      return ("KAKAO_INVALID_REQUEST", "로그인 요청이 올바르지 않습니다. Kakao iOS 앱 설정과 전달 파라미터를 확인해주세요.")

    case .InvalidClient:
      return ("KAKAO_INVALID_CLIENT", "카카오 iOS 앱 설정이 올바르지 않습니다. KAKAO_APP_KEY, 번들 ID, iOS 플랫폼 등록값을 확인해주세요.")

    case .AccessDenied:
      return ("KAKAO_ACCESS_DENIED", "사용자가 카카오 로그인을 취소했거나 접근 권한을 거부했습니다.")

    case .InvalidScope:
      return ("KAKAO_INVALID_SCOPE", "유효하지 않은 동의 항목(scope)입니다. 요청한 동의 항목과 Kakao 콘솔 설정을 확인해주세요.")

    case .Misconfigured:
      return ("KAKAO_MISCONFIGURED", "카카오 iOS 설정이 올바르지 않습니다. 번들 ID, URL scheme, KAKAO_APP_KEY, Kakao 콘솔 설정을 확인해주세요.")

    case .Unauthorized:
      return ("KAKAO_UNAUTHORIZED", "카카오 로그인 권한이 없습니다. 앱 권한과 플랫폼 설정을 확인해주세요.")

    case .InvalidGrant:
      return ("KAKAO_INVALID_GRANT", "인가 정보가 유효하지 않습니다. 다시 로그인해주세요.")

    case .ServerError:
      return ("KAKAO_SERVER_ERROR", "카카오 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")

    default:
      return ("KAKAO_AUTH_ERROR", description ?? authErrorInfo?.error.rawValue ?? fallback)
    }
  }

  // SDK 에러 해석
  static func parse(_ error: Error) -> (code: String, message: String) {
    guard let sdkError = error as? SdkError else {
      return ("KAKAO_ERROR", error.localizedDescription)
    }

    switch sdkError {
    // 클라이언트 에러
    case .ClientFailed(let reason, let errorMessage):
      switch reason {
      case .Cancelled:
        return ("KAKAO_CANCELLED", "사용자가 로그인을 취소했습니다.")
      case .NotSupported:
        return ("KAKAO_NOT_SUPPORTED", "지원하지 않는 기능입니다.")
      case .BadParameter:
        return ("KAKAO_BAD_PARAMETER", "잘못된 파라미터입니다. \(errorMessage ?? "")")
      case .TokenNotFound:
        return ("KAKAO_TOKEN_NOT_FOUND", "로그인이 필요합니다.")
      case .IllegalState:
        return ("KAKAO_ILLEGAL_STATE", "잘못된 상태입니다. \(errorMessage ?? "")")
      default:
        return ("KAKAO_CLIENT_ERROR", errorMessage ?? error.localizedDescription)
      }

    // API 에러
    case .ApiFailed(let reason, let errorInfo):
      switch reason {
      case .InvalidAccessToken:
        return ("KAKAO_UNAUTHORIZED", "인증이 만료되었습니다. 다시 로그인해주세요.")
      case .Permission, .InsufficientScope:
        return ("KAKAO_FORBIDDEN", "권한이 없습니다. 동의 항목을 확인해주세요.")
      case .ApiLimitExceed:
        return ("KAKAO_RATE_LIMIT", "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.")
      default:
        return ("KAKAO_API_ERROR", errorInfo?.msg ?? error.localizedDescription)
      }

    // 인증 에러
    case .AuthFailed(let reason, let authErrorInfo):
      return resolveAuthMessage(reason, authErrorInfo, error.localizedDescription)

    default:
      return ("KAKAO_ERROR", error.localizedDescription)
    }
  }
}
