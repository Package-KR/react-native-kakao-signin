package com.packagekr.kakao

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class RNKakaoSigninPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return when (name) {
            RNKakaoSigninModule.NAME -> RNKakaoSigninModule(reactContext)
            else -> null
        }
    }

    // 모듈 정보 생성
    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        val moduleList = arrayOf(RNKakaoSigninModule::class.java)
        val reactModuleInfoMap = HashMap<String, ReactModuleInfo>()

        for (moduleClass in moduleList) {
            val reactModule = moduleClass.getAnnotation(ReactModule::class.java) ?: continue

            reactModuleInfoMap[reactModule.name] = ReactModuleInfo(
                reactModule.name,
                moduleClass.name,
                false,
                reactModule.needsEagerInit,
                reactModule.isCxxModule,
                true
            )
        }

        return ReactModuleInfoProvider { reactModuleInfoMap }
    }

    // 뷰 매니저 반환
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
