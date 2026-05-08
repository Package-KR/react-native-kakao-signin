import Foundation
import KakaoSDKAuth

// 공통 헬퍼
enum RNKakaoSigninHelper {

  // 날짜 포맷 변환
  static func formatDate(_ date: Date?) -> String? {
    guard let date = date else {
      return nil
    }

    let f = DateFormatter()
    f.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    f.locale = Locale(identifier: "en_US_POSIX")
    f.timeZone = TimeZone(secondsFromGMT: 0)
    return f.string(from: date)
  }

  // 토큰 변환
  static func tokenToDict(_ token: OAuthToken?) -> [String: Any] {
    guard let token = token else { return [:] }
    return compact([
      "accessToken": token.accessToken,
      "refreshToken": token.refreshToken,
      "idToken": token.idToken as Any,
      "accessTokenExpiresAt": formatDate(token.expiredAt),
      "refreshTokenExpiresAt": formatDate(token.refreshTokenExpiredAt),
      "scopes": token.scopes as Any,
    ])
  }

  // 선택값 제거
  static func compact(_ dict: [String: Any?]) -> [String: Any] {
    return dict.reduce(into: [String: Any]()) { result, item in
      guard let rawValue = item.value,
            let value = unwrap(rawValue) else {
        return
      }

      if value is NSNull {
        return
      }

      if let stringValue = value as? String {
        let normalized = stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalized.isEmpty {
          return
        }

        result[item.key] = normalized
        return
      }

      result[item.key] = value
    }
  }

  // Optional 해제
  private static func unwrap(_ value: Any) -> Any? {
    let mirror = Mirror(reflecting: value)

    guard mirror.displayStyle == .optional else {
      return value
    }

    return mirror.children.first?.value
  }

  // 앱 키 해석
  static func resolveAppKey() -> String? {
    guard let value = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_KEY") as? String else {
      return nil
    }

    let appKey = value.trimmingCharacters(in: .whitespacesAndNewlines)
    return appKey.isEmpty ? nil : appKey
  }

  // 커스텀 URL scheme 해석
  static func resolveCustomScheme(appKey: String?) -> String? {
    if let configured = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_SCHEME") as? String {
      let scheme = configured.trimmingCharacters(in: .whitespacesAndNewlines)
      if !scheme.isEmpty {
        return scheme
      }
    }

    guard let urlTypes = Bundle.main.object(forInfoDictionaryKey: "CFBundleURLTypes") as? [[String: Any]] else {
      return nil
    }

    let expectedScheme = appKey.map { "kakao\($0)" }
    let normalizedSchemesByType = urlTypes.compactMap { urlType -> (name: String?, schemes: [String])? in
      guard let schemes = urlType["CFBundleURLSchemes"] as? [String] else {
        return nil
      }

      return (
        name: urlType["CFBundleURLName"] as? String,
        schemes: schemes.compactMap(normalizedScheme)
      )
    }

    if let expectedScheme,
       let matchingScheme = normalizedSchemesByType
        .flatMap(\.schemes)
        .first(where: { $0.caseInsensitiveCompare(expectedScheme) == .orderedSame }) {
      return matchingScheme
    }

    if let namedScheme = normalizedSchemesByType
      .first(where: { $0.name?.caseInsensitiveCompare("KAKAO") == .orderedSame })?
      .schemes
      .first {
      return namedScheme
    }

    return nil
  }

  // 카카오 OAuth redirect URL 판정
  static func isKakaoOAuthRedirect(_ url: URL, appKey: String) -> Bool {
    let expectedScheme = resolveCustomScheme(appKey: appKey) ?? "kakao\(appKey)"

    return url.scheme?.caseInsensitiveCompare(expectedScheme) == .orderedSame &&
      url.host?.caseInsensitiveCompare("oauth") == .orderedSame
  }

  // SDK enum raw value 정규화
  static func normalizedEnumValue(_ value: String?) -> String? {
    guard let value = value else {
      return nil
    }

    let normalized = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    return normalized.isEmpty ? nil : normalized
  }

  // URL scheme 정규화
  private static func normalizedScheme(_ value: String?) -> String? {
    guard let value = value else {
      return nil
    }

    let scheme = value.trimmingCharacters(in: .whitespacesAndNewlines)
    return scheme.isEmpty ? nil : scheme
  }
}
