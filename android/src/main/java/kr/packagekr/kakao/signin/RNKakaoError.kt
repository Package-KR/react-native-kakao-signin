package kr.packagekr.kakao.signin

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.kakao.sdk.common.model.ApiError
import com.kakao.sdk.common.model.ApiErrorCause
import com.kakao.sdk.common.model.AuthError
import com.kakao.sdk.common.model.AuthErrorCause
import com.kakao.sdk.common.model.ClientError
import com.kakao.sdk.common.model.ClientErrorCause

object RNKakaoError {
    // 변환된 에러
    data class ParsedError(
        val code: String,
        val message: String,
        val sdkMessage: String? = null,
    )

    // 에러 메시지
    private object Message {
        const val accessDenied = "Kakao login was cancelled or access was denied."
        const val activityDoesNotExist = "The current Activity could not be found."
        const val apiError = "A Kakao API error occurred."
        const val authError = "A Kakao authentication error occurred."
        const val badParameter = "Invalid parameter."
        const val cancelled = "Login was cancelled."
        const val clientError = "A Kakao client error occurred."
        const val defaultError = "An error occurred while processing the Kakao request."
        const val forbidden = "Permission is required. Please check the consent items."
        const val illegalState = "Invalid state."
        const val invalidAppKey = "The Kakao native app key is invalid. Please check your Kakao app key configuration."
        const val invalidBundleId = "The Android package name is invalid. Please check the Android package name in Kakao Developers and your app settings."
        const val invalidClient = "The Kakao Android app configuration is invalid. Please check the app key, package name, key hash, URL scheme, and platform settings."
        const val invalidGrant = "The authorization information is invalid. Please sign in again."
        const val invalidRequest = "The Kakao login request is invalid. Please check your Android app configuration and request parameters."
        const val invalidScope = "The requested scope is invalid. Please check the requested consent items and Kakao Developers settings."
        const val invalidUrlScheme = "The Android URL scheme is invalid. Please check AndroidManifest, kakao_custom_scheme, and Kakao Developers settings."
        const val loginRequired = "Kakao login authorization is required. Please check app permissions and platform settings."
        const val misconfigured = "The Kakao Android configuration is invalid. Please check the app key, package name, key hash, URL scheme, and Kakao Developers settings."
        const val notSupported = "This feature is not supported."
        const val profileNotFound = "Kakao profile information could not be found."
        const val rateLimit = "Too many requests. Please try again later."
        const val serverError = "A Kakao server error occurred. Please try again later."
        const val shippingAddressesNotFound = "Kakao shipping address information could not be found."
        const val tokenExpired = "Authentication has expired. Please sign in again."
        const val tokenNotFound = "Sign-in is required."
        const val unknownLogin = "Kakao login failed."
    }

    // 에러 코드
    const val ACTIVITY_DOES_NOT_EXIST = "KAKAO_ACTIVITY_DOES_NOT_EXIST"
    const val ACCESS_DENIED = "KAKAO_ACCESS_DENIED"
    const val API_ERROR = "KAKAO_API_ERROR"
    const val AUTH_ERROR = "KAKAO_AUTH_ERROR"
    const val BAD_PARAMETER = "KAKAO_BAD_PARAMETER"
    const val CANCELLED = "KAKAO_CANCELLED"
    const val CLIENT_ERROR = "KAKAO_CLIENT_ERROR"
    const val ERROR = "KAKAO_ERROR"
    const val FORBIDDEN = "KAKAO_FORBIDDEN"
    const val ILLEGAL_STATE = "KAKAO_ILLEGAL_STATE"
    const val INVALID_APP_KEY = "KAKAO_INVALID_APP_KEY"
    const val INVALID_BUNDLE_ID = "KAKAO_INVALID_BUNDLE_ID"
    const val INVALID_CLIENT = "KAKAO_INVALID_CLIENT"
    const val INVALID_GRANT = "KAKAO_INVALID_GRANT"
    const val INVALID_REQUEST = "KAKAO_INVALID_REQUEST"
    const val INVALID_SCOPE = "KAKAO_INVALID_SCOPE"
    const val INVALID_URL_SCHEME = "KAKAO_INVALID_URL_SCHEME"
    const val LOGIN_REQUIRED = "KAKAO_LOGIN_REQUIRED"
    const val MISCONFIGURED = "KAKAO_MISCONFIGURED"
    const val NOT_SUPPORTED = "KAKAO_NOT_SUPPORTED"
    const val PROFILE_NOT_FOUND = "KAKAO_PROFILE_NOT_FOUND"
    const val RATE_LIMIT = "KAKAO_RATE_LIMIT"
    const val SERVER_ERROR = "KAKAO_SERVER_ERROR"
    const val SHIPPING_ADDRESSES_NOT_FOUND = "KAKAO_SHIPPING_ADDRESSES_NOT_FOUND"
    const val TOKEN_EXPIRED = "KAKAO_TOKEN_EXPIRED"
    const val TOKEN_NOT_FOUND = "KAKAO_TOKEN_NOT_FOUND"
    const val UNKNOWN = "KAKAO_UNKNOWN_ERROR"

    // 에러 응답 변환
    fun reject(promise: Promise, error: Throwable) {
        val parsed = parse(error)
        rejectParsed(promise, parsed, error)
    }

    fun rejectParsed(promise: Promise, parsed: ParsedError, cause: Throwable? = null) {
        val userInfo = Arguments.createMap()

        parsed.sdkMessage?.let {
            userInfo.putString("sdkMessage", it)
        }

        promise.reject(parsed.code, parsed.message, cause, userInfo)
    }

    // 직접 에러 응답
    fun rejectActivityDoesNotExist(promise: Promise) {
        promise.reject(ACTIVITY_DOES_NOT_EXIST, Message.activityDoesNotExist)
    }

    fun rejectProfileNotFound(promise: Promise) {
        promise.reject(PROFILE_NOT_FOUND, Message.profileNotFound)
    }

    fun rejectShippingAddressesNotFound(promise: Promise) {
        promise.reject(SHIPPING_ADDRESSES_NOT_FOUND, Message.shippingAddressesNotFound)
    }

    fun rejectUnknownLogin(promise: Promise) {
        promise.reject(UNKNOWN, Message.unknownLogin)
    }

    fun rejectMisconfigured(promise: Promise) {
        promise.reject(MISCONFIGURED, Message.misconfigured)
    }

    // SDK 에러 변환
    fun parse(error: Throwable): ParsedError {
        return when (error) {
            is ClientError -> resolveClientError(error)
            is ApiError -> resolveApiError(error)
            is AuthError -> resolveAuthError(error)
            else -> make(ERROR, Message.defaultError, sdkMessage(error))
        }
    }

    fun isConfigurationError(error: ParsedError): Boolean {
        return when (error.code) {
            INVALID_APP_KEY,
            INVALID_BUNDLE_ID,
            INVALID_CLIENT,
            INVALID_URL_SCHEME,
            MISCONFIGURED -> true
            else -> false
        }
    }

    fun isTerminalLoginError(error: ParsedError): Boolean {
        return error.code == CANCELLED || error.code == ACCESS_DENIED
    }

    // 클라이언트 에러
    private fun resolveClientError(error: ClientError): ParsedError {
        val sdkMessage = sdkMessage(error)

        return when (error.reason) {
            ClientErrorCause.Cancelled ->
                make(CANCELLED, Message.cancelled, sdkMessage)
            ClientErrorCause.NotSupported ->
                make(NOT_SUPPORTED, Message.notSupported, sdkMessage)
            ClientErrorCause.BadParameter ->
                make(BAD_PARAMETER, Message.badParameter, sdkMessage)
            ClientErrorCause.TokenNotFound ->
                make(TOKEN_NOT_FOUND, Message.tokenNotFound, sdkMessage)
            ClientErrorCause.IllegalState ->
                make(ILLEGAL_STATE, Message.illegalState, sdkMessage)
            else -> make(CLIENT_ERROR, Message.clientError, sdkMessage)
        }
    }

    // API 에러
    private fun resolveApiError(error: ApiError): ParsedError {
        val sdkMessage = sdkMessage(error)

        return when (error.reason) {
            ApiErrorCause.InvalidToken ->
                make(TOKEN_EXPIRED, Message.tokenExpired, sdkMessage)
            ApiErrorCause.BlockedAccount, ApiErrorCause.BlockedApp, ApiErrorCause.PermissionDenied, ApiErrorCause.InsufficientScope ->
                make(FORBIDDEN, Message.forbidden, sdkMessage)
            ApiErrorCause.ApiLimitExceeded ->
                make(RATE_LIMIT, Message.rateLimit, sdkMessage)
            ApiErrorCause.IllegalParams ->
                make(BAD_PARAMETER, Message.badParameter, sdkMessage)
            ApiErrorCause.UnsupportedApi, ApiErrorCause.DeprecatedApi ->
                make(NOT_SUPPORTED, Message.notSupported, sdkMessage)
            ApiErrorCause.InternalError, ApiErrorCause.ServerTimeOut, ApiErrorCause.UnderMaintenance ->
                make(SERVER_ERROR, Message.serverError, sdkMessage)
            ApiErrorCause.AppDoesNotExist ->
                make(INVALID_APP_KEY, Message.invalidAppKey, sdkMessage)
            else -> make(API_ERROR, Message.apiError, sdkMessage)
        }
    }

    // 인증 에러
    private fun resolveAuthError(error: AuthError): ParsedError {
        val sdkMessage = error.response.errorDescription?.trim()?.takeIf { it.isNotEmpty() } ?: sdkMessage(error)
        val normalizedDescription = sdkMessage?.lowercase().orEmpty()

        return when (error.reason) {
            AuthErrorCause.InvalidRequest -> {
                when {
                    normalizedDescription.contains("package") || normalizedDescription.contains("bundle") ->
                        make(INVALID_BUNDLE_ID, Message.invalidBundleId, sdkMessage)
                    normalizedDescription.contains("scheme") || normalizedDescription.contains("redirect") ->
                        make(INVALID_URL_SCHEME, Message.invalidUrlScheme, sdkMessage)
                    normalizedDescription.contains("client") || normalizedDescription.contains("app key") ->
                        make(INVALID_APP_KEY, Message.invalidAppKey, sdkMessage)
                    else ->
                        make(INVALID_REQUEST, Message.invalidRequest, sdkMessage)
                }
            }
            AuthErrorCause.InvalidClient ->
                resolveAuthConfigurationError(normalizedDescription, sdkMessage)
            AuthErrorCause.AccessDenied ->
                make(ACCESS_DENIED, Message.accessDenied, sdkMessage)
            AuthErrorCause.InvalidScope ->
                make(INVALID_SCOPE, Message.invalidScope, sdkMessage)
            AuthErrorCause.Misconfigured ->
                make(MISCONFIGURED, Message.misconfigured, sdkMessage)
            AuthErrorCause.Unauthorized, AuthErrorCause.LoginRequired ->
                make(LOGIN_REQUIRED, Message.loginRequired, sdkMessage)
            AuthErrorCause.ConsentRequired, AuthErrorCause.InteractionRequired ->
                make(FORBIDDEN, Message.forbidden, sdkMessage)
            AuthErrorCause.InvalidGrant ->
                make(INVALID_GRANT, Message.invalidGrant, sdkMessage)
            AuthErrorCause.ServerError ->
                make(SERVER_ERROR, Message.serverError, sdkMessage)
            else -> make(AUTH_ERROR, Message.authError, sdkMessage)
        }
    }

    private fun resolveAuthConfigurationError(normalizedDescription: String, sdkMessage: String?): ParsedError {
        return when {
            normalizedDescription.contains("package") || normalizedDescription.contains("bundle") ->
                make(INVALID_BUNDLE_ID, Message.invalidBundleId, sdkMessage)
            normalizedDescription.contains("scheme") || normalizedDescription.contains("redirect") ->
                make(INVALID_URL_SCHEME, Message.invalidUrlScheme, sdkMessage)
            normalizedDescription.contains("client") || normalizedDescription.contains("app key") ->
                make(INVALID_APP_KEY, Message.invalidAppKey, sdkMessage)
            else ->
                make(INVALID_CLIENT, Message.invalidClient, sdkMessage)
        }
    }

    // SDK 원문 메시지 추출
    private fun sdkMessage(error: Throwable): String? {
        return error.message?.trim()?.takeIf { it.isNotEmpty() }
    }

    // 에러 생성
    private fun make(code: String, message: String, sdkMessage: String? = null): ParsedError {
        return ParsedError(code, message, sdkMessage)
    }
}
