import Foundation

import KakaoSDKAuth

// 공통 헬퍼
enum RNKakaoLoginHelper {

  static let dateFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM-dd HH:mm:ss"
    return f
  }()

  static func tokenToDict(_ token: OAuthToken?) -> [String: Any] {
    guard let token = token else { return [:] }
    return [
      "accessToken": token.accessToken,
      "refreshToken": token.refreshToken,
      "idToken": token.idToken ?? "",
      "accessTokenExpiresAt": dateFormatter.string(from: token.expiredAt),
      "refreshTokenExpiresAt": dateFormatter.string(from: token.refreshTokenExpiredAt),
      "scopes": token.scopes ?? [],
    ]
  }
}
