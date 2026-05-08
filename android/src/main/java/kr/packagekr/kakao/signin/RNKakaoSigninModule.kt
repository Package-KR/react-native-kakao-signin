package kr.packagekr.kakao.signin

import android.content.pm.PackageManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

import com.kakao.sdk.common.KakaoSdk
import com.kakao.sdk.user.UserApiClient
import com.kakao.sdk.auth.TokenManagerProvider
import com.kakao.sdk.auth.model.OAuthToken
import com.kakao.sdk.user.model.AgeRange
import com.kakao.sdk.user.model.BirthdayType
import com.kakao.sdk.user.model.Gender
import com.kakao.sdk.user.model.ServiceTerms
import com.kakao.sdk.user.model.ShippingAddress
import com.kakao.sdk.user.model.ShippingAddressType
import com.kakao.sdk.user.model.User
import com.kakao.sdk.user.model.UserServiceTerms
import com.kakao.sdk.user.model.UserShippingAddresses

@ReactModule(name = RNKakaoSigninModule.NAME)
class RNKakaoSigninModule(
    reactContext: ReactApplicationContext
) : NativeRNKakaoSigninSpec(reactContext) {

    companion object {
        const val NAME = "RNKakaoSignin"
        private val configurationLock = Any()
    }

    init {
        configureKakaoSdkIfNeeded()
    }

    override fun getName(): String {
        return NAME
    }

    // SDK 초기화
    private fun configureKakaoSdkIfNeeded(): Boolean {
        synchronized(configurationLock) {
            if (KakaoSdk.isInitialized) {
                return true
            }

            val appKey = resolveMetaData("com.kakao.sdk.AppKey")
                ?: resolveString("kakao_app_key")
                ?: return false

            val customScheme = resolveString("kakao_custom_scheme")

            if (customScheme == null) {
                KakaoSdk.init(reactApplicationContext, appKey)
                return true
            }

            KakaoSdk.init(reactApplicationContext, appKey, customScheme)
            return true
        }
    }

    // 카카오톡 로그인
    @ReactMethod
    override fun login(promise: Promise) {
        runConfiguredOnUiThread(promise) {
            val activity = reactApplicationContext.getCurrentActivity()

            if (activity == null) {
                RNKakaoError.rejectActivityDoesNotExist(promise)
                return@runConfiguredOnUiThread
            }

            if (!UserApiClient.instance.isKakaoTalkLoginAvailable(activity)) {
                loginWithAccount(promise)
                return@runConfiguredOnUiThread
            }

            UserApiClient.instance.loginWithKakaoTalk(activity) { token, error ->
                when {
                    token != null -> promise.resolve(resolveToken(token))
                    error != null -> {
                        val parsedError = RNKakaoError.parse(error)

                        when {
                            RNKakaoError.isTerminalLoginError(parsedError) ->
                                RNKakaoError.rejectParsed(promise, parsedError, error)
                            RNKakaoError.isConfigurationError(parsedError) ->
                                RNKakaoError.rejectParsed(promise, parsedError, error)
                            else ->
                                loginWithAccount(promise)
                        }
                    }
                    else -> RNKakaoError.rejectUnknownLogin(promise)
                }
            }
        }
    }

    // 카카오계정 로그인
    @ReactMethod
    override fun loginWithKakaoAccount(promise: Promise) {
        runConfiguredOnUiThread(promise) {
            loginWithAccount(promise)
        }
    }

    // 로그아웃
    @ReactMethod
    override fun logout(promise: Promise) {
        runConfigured(promise) {
            UserApiClient.instance.logout(unitCallback(promise))
        }
    }

    // 연결 해제
    @ReactMethod
    override fun unlink(promise: Promise) {
        runConfigured(promise) {
            UserApiClient.instance.unlink(unitCallback(promise))
        }
    }

    // 액세스 토큰 조회
    @ReactMethod
    override fun getAccessToken(promise: Promise) {
        runConfigured(promise) {
            val token = TokenManagerProvider.instance.manager.getToken()

            if (token == null) {
                promise.resolve(null)
                return@runConfigured
            }

            val result = Arguments.createMap()
            val expiresIn = ((token.accessTokenExpiresAt.time - System.currentTimeMillis()) / 1000.0)
                .coerceAtLeast(0.0)

            result.putString("accessToken", token.accessToken)
            result.putDouble("expiresIn", expiresIn)
            promise.resolve(result)
        }
    }

    // 프로필 조회
    @ReactMethod
    override fun getProfile(promise: Promise) {
        runConfigured(promise) {
            UserApiClient.instance.me { user, error ->
                if (error != null) {
                    RNKakaoError.reject(promise, error)
                    return@me
                }

                if (user == null) {
                    RNKakaoError.rejectProfileNotFound(promise)
                    return@me
                }

                promise.resolve(profileToMap(user))
            }
        }
    }

    // 배송지 조회
    @ReactMethod
    override fun shippingAddresses(promise: Promise) {
        runConfigured(promise) {
            UserApiClient.instance.shippingAddresses { addresses, error ->
                if (error != null) {
                    RNKakaoError.reject(promise, error)
                    return@shippingAddresses
                }

                if (addresses == null) {
                    RNKakaoError.rejectShippingAddressesNotFound(promise)
                    return@shippingAddresses
                }

                promise.resolve(shippingAddressesToMap(addresses))
            }
        }
    }

    // 서비스 약관 조회
    @ReactMethod
    override fun serviceTerms(promise: Promise) {
        runConfigured(promise) {
            UserApiClient.instance.serviceTerms { terms, error ->
                if (error != null) {
                    RNKakaoError.reject(promise, error)
                    return@serviceTerms
                }

                promise.resolve(serviceTermsToMap(terms))
            }
        }
    }

    // 카카오계정 웹 로그인
    private fun loginWithAccount(promise: Promise) {
        val activity = reactApplicationContext.getCurrentActivity()

        if (activity == null) {
            RNKakaoError.rejectActivityDoesNotExist(promise)
            return
        }

        UserApiClient.instance.loginWithKakaoAccount(activity) { token, error ->
            tokenCallback(promise)(token, error)
        }
    }

    private fun runConfiguredOnUiThread(promise: Promise, action: () -> Unit) {
        UiThreadUtil.runOnUiThread {
            if (!ensureConfigured(promise)) {
                return@runOnUiThread
            }

            action()
        }
    }

    private fun ensureConfigured(promise: Promise): Boolean {
        if (configureKakaoSdkIfNeeded()) {
            return true
        }

        RNKakaoError.rejectMisconfigured(promise)
        return false
    }

    private fun runConfigured(promise: Promise, action: () -> Unit) {
        if (!ensureConfigured(promise)) {
            return
        }

        action()
    }

    // 앱 메타데이터 조회
    private fun resolveMetaData(key: String): String? {
        return try {
            val packageInfo = reactApplicationContext.packageManager.getApplicationInfo(
                reactApplicationContext.packageName,
                PackageManager.GET_META_DATA
            )

            packageInfo.metaData?.getString(key)?.trim()?.takeIf { it.isNotEmpty() }
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

        return reactApplicationContext.getString(resourceId).trim().takeIf { it.isNotEmpty() }
    }

    // 토큰 응답 생성
    private fun resolveToken(oauthToken: OAuthToken): WritableMap {
        val token = Arguments.createMap()

        token.putString("accessToken", oauthToken.accessToken)
        token.putString("refreshToken", oauthToken.refreshToken)
        token.putStringIfPresent("idToken", oauthToken.idToken)
        token.putStringIfPresent("accessTokenExpiresAt", formatDate(oauthToken.accessTokenExpiresAt))
        token.putStringIfPresent("refreshTokenExpiresAt", formatDate(oauthToken.refreshTokenExpiresAt))

        if (oauthToken.scopes != null) {
            val scopeArray = Arguments.createArray()
            oauthToken.scopes?.forEach { scopeArray.pushString(it) }
            token.putArray("scopes", scopeArray)
        }

        return token
    }

    private fun tokenCallback(promise: Promise): (OAuthToken?, Throwable?) -> Unit {
        return { token, error ->
            when {
                token != null -> promise.resolve(resolveToken(token))
                error != null -> RNKakaoError.reject(promise, error)
                else -> RNKakaoError.rejectUnknownLogin(promise)
            }
        }
    }

    private fun unitCallback(promise: Promise): (Throwable?) -> Unit {
        return { error ->
            if (error != null) {
                RNKakaoError.reject(promise, error)
            } else {
                promise.resolve(true)
            }
        }
    }

    private fun profileToMap(user: User): WritableMap {
        val profile = Arguments.createMap()
        val account = user.kakaoAccount
        val detail = account?.profile

        profile.putStringIfPresent("id", user.id?.toString())
        profile.putStringIfPresent("name", account?.name)
        profile.putStringIfPresent("email", account?.email)
        profile.putStringIfPresent("nickname", detail?.nickname)
        profile.putStringIfPresent("profileImageUrl", detail?.profileImageUrl)
        profile.putStringIfPresent("thumbnailImageUrl", detail?.thumbnailImageUrl)
        profile.putStringIfPresent("phoneNumber", account?.phoneNumber)
        profile.putStringIfPresent("ageRange", formatAgeRange(account?.ageRange))
        profile.putStringIfPresent("birthday", account?.birthday)
        profile.putStringIfPresent("birthdayType", formatBirthdayType(account?.birthdayType))
        profile.putStringIfPresent("birthyear", account?.birthyear)
        profile.putStringIfPresent("gender", formatGender(account?.gender))
        profile.putBooleanIfPresent("isEmailValid", account?.isEmailValid)
        profile.putBooleanIfPresent("isEmailVerified", account?.isEmailVerified)
        profile.putBooleanIfPresent("isKorean", account?.isKorean)
        profile.putBooleanIfPresent("isDefaultImage", detail?.isDefaultImage)
        profile.putBooleanIfPresent("isLeapMonth", account?.isLeapMonth)
        profile.putStringIfPresent("connectedAt", formatDate(user.connectedAt))
        profile.putStringIfPresent("synchedAt", formatDate(user.synchedAt))
        profile.putStringIfPresent("legalName", account?.legalName)
        profile.putStringIfPresent("legalBirthDate", account?.legalBirthDate)
        profile.putStringIfPresent("legalGender", formatGender(account?.legalGender))
        profile.putBooleanIfPresent("ageRangeNeedsAgreement", account?.ageRangeNeedsAgreement)
        profile.putBooleanIfPresent("birthdayNeedsAgreement", account?.birthdayNeedsAgreement)
        profile.putBooleanIfPresent("birthyearNeedsAgreement", account?.birthyearNeedsAgreement)
        profile.putBooleanIfPresent("emailNeedsAgreement", account?.emailNeedsAgreement)
        profile.putBooleanIfPresent("genderNeedsAgreement", account?.genderNeedsAgreement)
        profile.putBooleanIfPresent("isKoreanNeedsAgreement", account?.isKoreanNeedsAgreement)
        profile.putBooleanIfPresent("phoneNumberNeedsAgreement", account?.phoneNumberNeedsAgreement)
        profile.putBooleanIfPresent("profileNeedsAgreement", account?.profileNeedsAgreement)
        profile.putBooleanIfPresent("profileNicknameNeedsAgreement", account?.profileNicknameNeedsAgreement)
        profile.putBooleanIfPresent("profileImageNeedsAgreement", account?.profileImageNeedsAgreement)
        profile.putBooleanIfPresent("nameNeedsAgreement", account?.nameNeedsAgreement)
        profile.putBooleanIfPresent("legalNameNeedsAgreement", account?.legalNameNeedsAgreement)
        profile.putBooleanIfPresent("legalBirthDateNeedsAgreement", account?.legalBirthDateNeedsAgreement)
        profile.putBooleanIfPresent("legalGenderNeedsAgreement", account?.legalGenderNeedsAgreement)

        return profile
    }

    private fun shippingAddressesToMap(addresses: UserShippingAddresses): WritableMap {
        val result = Arguments.createMap()
        val array = Arguments.createArray()

        result.putStringIfPresent("userId", addresses.userId?.toString())
        result.putBooleanIfPresent("needsAgreement", addresses.needsAgreement)
        addresses.shippingAddresses.orEmpty().forEach { array.pushMap(shippingAddressToMap(it)) }
        result.putArray("shippingAddresses", array)

        return result
    }

    private fun shippingAddressToMap(address: ShippingAddress): WritableMap {
        return Arguments.createMap().apply {
            putStringIfPresent("id", address.id?.toString())
            putStringIfPresent("name", address.name)
            putBooleanIfPresent("isDefault", address.isDefault)
            putStringIfPresent("updatedAt", formatDate(address.updatedAt))
            putStringIfPresent("type", formatShippingAddressType(address.type))
            putStringIfPresent("baseAddress", address.baseAddress)
            putStringIfPresent("detailAddress", address.detailAddress)
            putStringIfPresent("receiverName", address.receiverName)
            putStringIfPresent("receiverPhoneNumber1", address.receiverPhoneNumber1)
            putStringIfPresent("receiverPhoneNumber2", address.receiverPhoneNumber2)
            putStringIfPresent("zoneNumber", address.zoneNumber)
            putStringIfPresent("zipCode", address.zipCode)
        }
    }

    private fun serviceTermsToMap(terms: UserServiceTerms?): WritableMap {
        val result = Arguments.createMap()
        val array = Arguments.createArray()

        terms?.id?.let { result.putString("userId", it.toString()) }
        terms?.serviceTerms.orEmpty().forEach { array.pushMap(serviceTermToMap(it)) }
        result.putArray("serviceTerms", array)

        return result
    }

    private fun serviceTermToMap(term: ServiceTerms): WritableMap {
        return Arguments.createMap().apply {
            putStringIfPresent("tag", term.tag)
            putBoolean("agreed", term.agreed)
            putBoolean("required", term.required)
            putBoolean("revocable", term.revocable)
            putStringIfPresent("agreedAt", formatDate(term.agreedAt))
        }
    }

    private fun formatAgeRange(ageRange: AgeRange?): String? {
        return when (ageRange) {
            AgeRange.AGE_0_9 -> "0~9"
            AgeRange.AGE_10_14 -> "10~14"
            AgeRange.AGE_15_19 -> "15~19"
            AgeRange.AGE_20_29 -> "20~29"
            AgeRange.AGE_30_39 -> "30~39"
            AgeRange.AGE_40_49 -> "40~49"
            AgeRange.AGE_50_59 -> "50~59"
            AgeRange.AGE_60_69 -> "60~69"
            AgeRange.AGE_70_79 -> "70~79"
            AgeRange.AGE_80_89 -> "80~89"
            AgeRange.AGE_90_ABOVE -> "90~"
            AgeRange.UNKNOWN -> "unknown"
            null -> null
        }
    }

    private fun formatGender(gender: Gender?): String? {
        return when (gender) {
            Gender.FEMALE -> "female"
            Gender.MALE -> "male"
            Gender.UNKNOWN -> "unknown"
            null -> null
        }
    }

    private fun formatBirthdayType(birthdayType: BirthdayType?): String? {
        return when (birthdayType) {
            BirthdayType.SOLAR -> "solar"
            BirthdayType.LUNAR -> "lunar"
            BirthdayType.UNKNOWN -> "unknown"
            null -> null
        }
    }

    private fun formatShippingAddressType(type: ShippingAddressType?): String? {
        return when (type) {
            ShippingAddressType.OLD -> "old"
            ShippingAddressType.NEW -> "new"
            ShippingAddressType.UNKNOWN -> "unknown"
            null -> null
        }
    }

    // 선택값 입력
    private fun WritableMap.putStringIfPresent(key: String, value: String?) {
        val normalized = value?.trim()?.takeIf { it.isNotEmpty() }

        if (normalized != null) {
            putString(key, normalized)
        }
    }

    private fun WritableMap.putBooleanIfPresent(key: String, value: Boolean?) {
        if (value != null) {
            putBoolean(key, value)
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
