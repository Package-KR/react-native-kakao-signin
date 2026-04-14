package kr.packagekr.kakao.signin

import android.content.pm.PackageManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.kakao.sdk.auth.TokenManagerProvider
import com.kakao.sdk.common.KakaoSdk
import com.kakao.sdk.common.model.ClientError
import com.kakao.sdk.common.model.ClientErrorCause
import com.kakao.sdk.common.util.Utility
import com.kakao.sdk.user.UserApiClient
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

@ReactModule(name = RNKakaoSigninModule.NAME)
class RNKakaoSigninModule(
    reactContext: ReactApplicationContext
) : NativeRNKakaoSigninSpec(reactContext) {

    companion object {
        const val NAME = "RNKakaoSignin"
    }

    init {
        configureKakaoSdk()
    }

    override fun getName(): String {
        return NAME
    }

    // SDK 초기화
    private fun configureKakaoSdk() {
        if (KakaoSdk.isInitialized) {
            return
        }

        val appKey = resolveMetaData("com.kakao.sdk.AppKey")
            ?: resolveString("kakao_app_key")
            ?: return

        val customScheme = resolveString("kakao_custom_scheme")

        if (customScheme.isNullOrBlank()) {
            KakaoSdk.init(reactApplicationContext, appKey)
            return
        }

        KakaoSdk.init(reactApplicationContext, appKey, customScheme)
    }

    // 카카오톡 로그인
    @ReactMethod
    override fun login(promise: Promise) {
        val activity = currentActivity

        if (activity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        if (!UserApiClient.instance.isKakaoTalkLoginAvailable(activity)) {
            loginWithAccount(promise)
            return
        }

        UserApiClient.instance.loginWithKakaoTalk(activity) { token, error ->
            when {
                token != null -> promise.resolve(resolveToken(token.accessToken, token.refreshToken, token.idToken, token.scopes))
                error is ClientError && error.reason == ClientErrorCause.Cancelled ->
                    promise.reject("E_CANCELLED_OPERATION", error.message, error)
                error != null -> loginWithAccount(promise)
                else -> promise.reject("E_UNKNOWN_ERROR", "Login failed")
            }
        }
    }

    // 카카오계정 로그인
    @ReactMethod
    override fun loginWithKakaoAccount(promise: Promise) {
        loginWithAccount(promise)
    }

    // 로그아웃
    @ReactMethod
    override fun logout(promise: Promise) {
        UserApiClient.instance.logout { error ->
            if (error != null) {
                promise.reject("E_FAILED_OPERATION", error.message, error)
                return@logout
            }

            promise.resolve(true)
        }
    }

    // 연결 해제
    @ReactMethod
    override fun unlink(promise: Promise) {
        UserApiClient.instance.unlink { error ->
            if (error != null) {
                promise.reject("E_FAILED_OPERATION", error.message, error)
                return@unlink
            }

            promise.resolve(true)
        }
    }

    // 액세스 토큰 조회
    @ReactMethod
    override fun getAccessToken(promise: Promise) {
        val token = TokenManagerProvider.instance.manager.getToken()

        if (token == null) {
            promise.resolve(null)
            return
        }

        promise.resolve(resolveToken(token.accessToken, token.refreshToken, token.idToken, token.scopes))
    }

    // 프로필 조회
    @ReactMethod
    override fun getProfile(promise: Promise) {
        UserApiClient.instance.me { user, error ->
            if (error != null) {
                promise.reject("E_FAILED_OPERATION", error.message, error)
                return@me
            }

            if (user == null) {
                promise.reject("E_PROFILE_NOT_FOUND", "Profile not found")
                return@me
            }

            val profile = Arguments.createMap()
            val account = user.kakaoAccount
            val detail = account?.profile

            profile.putString("id", user.id?.toString())
            profile.putString("name", account?.name)
            profile.putString("email", account?.email)
            profile.putString("nickname", detail?.nickname)
            profile.putString("profileImageUrl", detail?.profileImageUrl)
            profile.putString("thumbnailImageUrl", detail?.thumbnailImageUrl)
            profile.putString("phoneNumber", account?.phoneNumber)
            profile.putString("ageRange", account?.ageRange?.toString())
            profile.putString("birthday", account?.birthday)
            profile.putString("birthdayType", account?.birthdayType?.toString())
            profile.putString("birthyear", account?.birthyear)
            profile.putString("gender", account?.gender?.toString())
            account?.isEmailValid?.let { profile.putBoolean("isEmailValid", it) }
            account?.isEmailVerified?.let { profile.putBoolean("isEmailVerified", it) }
            account?.isKorean?.let { profile.putBoolean("isKorean", it) }
            detail?.isDefaultImage?.let { profile.putBoolean("isDefaultImage", it) }
            account?.isLeapMonth?.let { profile.putBoolean("isLeapMonth", it) }
            profile.putString("connectedAt", formatDate(user.connectedAt))
            profile.putString("synchedAt", formatDate(user.synchedAt))
            profile.putString("legalName", account?.legalName)
            profile.putString("legalBirthDate", account?.legalBirthDate)
            profile.putString("legalGender", account?.legalGender?.toString())
            account?.ageRangeNeedsAgreement?.let { profile.putBoolean("ageRangeNeedsAgreement", it) }
            account?.birthdayNeedsAgreement?.let { profile.putBoolean("birthdayNeedsAgreement", it) }
            account?.birthyearNeedsAgreement?.let { profile.putBoolean("birthyearNeedsAgreement", it) }
            account?.emailNeedsAgreement?.let { profile.putBoolean("emailNeedsAgreement", it) }
            account?.genderNeedsAgreement?.let { profile.putBoolean("genderNeedsAgreement", it) }
            account?.isKoreanNeedsAgreement?.let { profile.putBoolean("isKoreanNeedsAgreement", it) }
            account?.phoneNumberNeedsAgreement?.let { profile.putBoolean("phoneNumberNeedsAgreement", it) }
            account?.profileNeedsAgreement?.let { profile.putBoolean("profileNeedsAgreement", it) }
            account?.profileNicknameNeedsAgreement?.let { profile.putBoolean("profileNicknameNeedsAgreement", it) }
            account?.profileImageNeedsAgreement?.let { profile.putBoolean("profileImageNeedsAgreement", it) }
            account?.nameNeedsAgreement?.let { profile.putBoolean("nameNeedsAgreement", it) }
            account?.legalNameNeedsAgreement?.let { profile.putBoolean("legalNameNeedsAgreement", it) }
            account?.legalBirthDateNeedsAgreement?.let { profile.putBoolean("legalBirthDateNeedsAgreement", it) }
            account?.legalGenderNeedsAgreement?.let { profile.putBoolean("legalGenderNeedsAgreement", it) }
            promise.resolve(profile)
        }
    }

    // 배송지 조회
    @ReactMethod
    override fun shippingAddresses(promise: Promise) {
        UserApiClient.instance.shippingAddresses { addresses, error ->
            if (error != null) {
                promise.reject("E_FAILED_OPERATION", error.message, error)
                return@shippingAddresses
            }

            if (addresses == null) {
                promise.reject("E_SHIPPING_ADDRESSES_NOT_FOUND", "Shipping addresses not found")
                return@shippingAddresses
            }

            val result = Arguments.createMap()
            result.putString("userId", addresses.userId?.toString())
            addresses.needsAgreement?.let { result.putBoolean("needsAgreement", it) }

            val array = Arguments.createArray()
            addresses.shippingAddresses?.map { addr ->
                Arguments.createMap().apply {
                    putString("id", addr.id?.toString())
                    putString("name", addr.name)
                    addr.isDefault?.let { putBoolean("isDefault", it) }
                    putString("updatedAt", formatDate(addr.updatedAt))
                    putString("type", addr.type?.toString())
                    putString("baseAddress", addr.baseAddress)
                    putString("detailAddress", addr.detailAddress)
                    putString("receiverName", addr.receiverName)
                    putString("receiverPhoneNumber1", addr.receiverPhoneNumber1)
                    putString("receiverPhoneNumber2", addr.receiverPhoneNumber2)
                    putString("zoneNumber", addr.zoneNumber)
                    putString("zipCode", addr.zipCode)
                }
            }?.forEach(array::pushMap)
            result.putArray("shippingAddresses", array)

            promise.resolve(result)
        }
    }

    // 서비스 약관 조회
    @ReactMethod
    override fun serviceTerms(promise: Promise) {
        UserApiClient.instance.serviceTerms { terms, error ->
            if (error != null) {
                promise.reject("E_FAILED_OPERATION", error.message, error)
                return@serviceTerms
            }

            val result = Arguments.createMap()
            terms?.id?.let { result.putString("userId", it.toString()) }

            val array = Arguments.createArray()
            terms?.serviceTerms?.map { term ->
                Arguments.createMap().apply {
                    putString("tag", term.tag)
                    putBoolean("agreed", term.agreed)
                    putBoolean("required", term.required)
                    putBoolean("revocable", term.revocable)
                    term.agreedAt?.let { putString("agreedAt", formatDate(it)) }
                }
            }?.forEach(array::pushMap)
            if (array.size() > 0) {
                result.putArray("serviceTerms", array)
            }

            promise.resolve(result)
        }
    }

    // 카카오계정 웹 로그인
    private fun loginWithAccount(promise: Promise) {
        val activity = currentActivity

        if (activity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        UserApiClient.instance.loginWithKakaoAccount(activity) { token, error ->
            when {
                token != null -> promise.resolve(resolveToken(token.accessToken, token.refreshToken, token.idToken, token.scopes))
                error != null -> promise.reject(resolveErrorCode(error), error.message, error)
                else -> promise.reject("E_UNKNOWN_ERROR", "Login failed")
            }
        }
    }

    // 앱 메타데이터 조회
    private fun resolveMetaData(key: String): String? {
        return try {
            val packageInfo = reactApplicationContext.packageManager.getApplicationInfo(
                reactApplicationContext.packageName,
                PackageManager.GET_META_DATA
            )

            packageInfo.metaData?.getString(key)
        } catch (_: Exception) {
            null
        }
    }

    // 문자열 리소스 조회
    private fun resolveString(name: String): String? {
        val resourceId = reactApplicationContext.resources.getIdentifier(
            name,
            "string",
            reactApplicationContext.packageName
        )

        if (resourceId == 0) {
            return null
        }

        return reactApplicationContext.getString(resourceId)
    }

    // 토큰 응답 생성
    private fun resolveToken(accessToken: String?, refreshToken: String?, idToken: String? = null, scopes: List<String>? = null): WritableMap {
        val token = Arguments.createMap()
        val current = TokenManagerProvider.instance.manager.getToken()

        token.putString("accessToken", accessToken)
        token.putString("refreshToken", refreshToken)
        token.putString("idToken", idToken)
        token.putString("accessTokenExpiresAt", formatDate(current?.accessTokenExpiresAt))
        token.putString("refreshTokenExpiresAt", formatDate(current?.refreshTokenExpiresAt))
        token.putString("appKeyHash", Utility.getKeyHash(reactApplicationContext))

        val scopeArray = Arguments.createArray()
        scopes?.forEach { scopeArray.pushString(it) }
        token.putArray("scopes", scopeArray)

        return token
    }

    // 에러 코드 변환
    private fun resolveErrorCode(error: Throwable): String {
        return when {
            error is ClientError && error.reason == ClientErrorCause.Cancelled ->
                "E_CANCELLED_OPERATION"
            else -> "E_FAILED_OPERATION"
        }
    }

    // 날짜 포맷 변환
    private fun formatDate(date: Date?): String? {
        if (date == null) {
            return null
        }

        val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        formatter.timeZone = TimeZone.getTimeZone("UTC")
        return formatter.format(date)
    }
}
