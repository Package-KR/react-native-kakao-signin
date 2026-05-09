package kr.packagekr.kakao.signin

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class RNKakaoSigninPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == RNKakaoSigninModule.NAME) RNKakaoSigninModule(reactContext) else null

    // 모듈 정보 생성
    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
        mapOf(
            RNKakaoSigninModule.NAME to ReactModuleInfo(
                RNKakaoSigninModule.NAME,
                RNKakaoSigninModule::class.java.name,
                false,
                false,
                false,
                true
            )
        )
    }

    // 뷰 매니저 반환
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
