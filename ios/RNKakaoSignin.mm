// React Native 브리지 / TurboModule 연결
#import <React/RCTBridgeModule.h>
#if __has_include(<RNKakaoSignin/RNKakaoSignin.h>)
#import <RNKakaoSignin/RNKakaoSignin.h>
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#if __has_include(<RNKakaoSigninSpec/RNKakaoSigninSpec.h>)
#import <RNKakaoSigninSpec/RNKakaoSigninSpec.h>
#endif
#endif

@interface RCT_EXTERN_MODULE(RNKakaoSignin, NSObject)

// JavaScript 브리지 export
RCT_EXTERN_METHOD(login:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(loginWithKakaoAccount:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(logout:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(unlink:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(getProfile:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(getAccessToken:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(shippingAddresses:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(serviceTerms:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

@end

#ifdef RCT_NEW_ARCH_ENABLED
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-protocol-method-implementation"

// New Architecture TurboModule 연결
@interface RNKakaoSignin () <NativeRNKakaoSigninSpec>
@end

@implementation RNKakaoSignin (TurboModule)
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNKakaoSigninSpecJSI>(params);
}
@end

#pragma clang diagnostic pop
#endif
