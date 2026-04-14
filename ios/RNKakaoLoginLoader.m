#import <UIKit/UIKit.h>
#import <objc/runtime.h>

// 카카오 로그인 URL을 체크하는 Swift 클래스
@interface RNKakaoSignin : NSObject
+ (BOOL)isKakaoTalkLoginUrl:(NSURL *)url;
+ (BOOL)handleOpenUrl:(NSURL *)url;
+ (BOOL)isSDKInitialized;
@end

typedef BOOL (*RNKakaoOpenURLIMP)(id, SEL, UIApplication *, NSURL *, NSDictionary *);
typedef BOOL (*RNKakaoContinueUserActivityIMP)(id, SEL, UIApplication *, NSUserActivity *, void (^)(NSArray<id<UIUserActivityRestoring>> *));
typedef void (*RNKakaoSetOriginalIMP)(IMP imp);

static RNKakaoOpenURLIMP rnKakaoOriginalOpenURLIMP = NULL;
static RNKakaoContinueUserActivityIMP rnKakaoOriginalContinueUserActivityIMP = NULL;

static void RNKakaoStoreOpenURLIMP(IMP imp);
static void RNKakaoStoreUserActivityIMP(IMP imp);
static BOOL RNKakaoHandleURL(NSURL *url);
static void RNKakaoInstallHandler(Class cls, SEL selector, IMP interceptor, const char *types, RNKakaoSetOriginalIMP storeOriginal, NSString *name);

// 카카오 로그인 복귀 URL 처리
static BOOL RNKakaoHandleURL(NSURL *url) {
  if (url == nil) {
    return NO;
  }

  // SDK 초기화 전에는 카카오 URL 체크를 하지 않음
  if (![RNKakaoSignin isSDKInitialized]) {
    return NO;
  }

  if ([RNKakaoSignin isKakaoTalkLoginUrl:url]) {
    return [RNKakaoSignin handleOpenUrl:url];
  }

  return NO;
}

// openURL 복귀 처리
static BOOL RNKakaoSignin_openURL(id self, SEL _cmd, UIApplication *app, NSURL *url, NSDictionary *options) {
  NSLog(@"[RNKakaoSignin] openURL received: %@", url.absoluteString);

  if (RNKakaoHandleURL(url)) {
    return YES;
  }

  if (rnKakaoOriginalOpenURLIMP != NULL) {
    return rnKakaoOriginalOpenURLIMP(self, _cmd, app, url, options);
  }

  return NO;
}

// universal link 복귀 처리
static BOOL RNKakaoSignin_continueUserActivity(
  id self,
  SEL _cmd,
  UIApplication *app,
  NSUserActivity *userActivity,
  void (^restorationHandler)(NSArray<id<UIUserActivityRestoring>> *)
) {
  NSURL *url = userActivity.webpageURL;
  NSLog(@"[RNKakaoSignin] continueUserActivity received: %@", url.absoluteString);

  if (RNKakaoHandleURL(url)) {
    return YES;
  }

  if (rnKakaoOriginalContinueUserActivityIMP != NULL) {
    return rnKakaoOriginalContinueUserActivityIMP(self, _cmd, app, userActivity, restorationHandler);
  }

  return NO;
}

// 기존 openURL 저장
static void RNKakaoStoreOpenURLIMP(IMP imp) {
  rnKakaoOriginalOpenURLIMP = (RNKakaoOpenURLIMP)imp;
}

// 기존 continueUserActivity 저장
static void RNKakaoStoreUserActivityIMP(IMP imp) {
  rnKakaoOriginalContinueUserActivityIMP = (RNKakaoContinueUserActivityIMP)imp;
}

// delegate 메서드 주입
static void RNKakaoInstallHandler(
  Class cls,
  SEL selector,
  IMP interceptor,
  const char *types,
  RNKakaoSetOriginalIMP storeOriginal,
  NSString *name
) {
  Method method = class_getInstanceMethod(cls, selector);

  if (method == NULL) {
    class_addMethod(cls, selector, interceptor, types);
    NSLog(@"[RNKakaoSignin] %@ added to %@", name, NSStringFromClass(cls));
    return;
  }

  storeOriginal(method_getImplementation(method));
  method_setImplementation(method, interceptor);
  NSLog(@"[RNKakaoSignin] %@ swizzled on %@", name, NSStringFromClass(cls));
}

// 로더
@interface RNKakaoSigninLoader : NSObject
@end

@implementation RNKakaoSigninLoader

// 앱 delegate 주입
+ (void)load {
  int classCount = objc_getClassList(NULL, 0);
  if (classCount <= 0) {
    return;
  }

  Class *classes = (__unsafe_unretained Class *)malloc(sizeof(Class) * (NSUInteger)classCount);
  classCount = objc_getClassList(classes, classCount);

  // UIApplicationDelegate 채택 클래스 주입
  for (int i = 0; i < classCount; i += 1) {
    Class cls = classes[i];
    if (!class_conformsToProtocol(cls, @protocol(UIApplicationDelegate))) {
      continue;
    }

    RNKakaoInstallHandler(
      cls,
      @selector(application:openURL:options:),
      (IMP)RNKakaoSignin_openURL,
      "B@:@@@",
      RNKakaoStoreOpenURLIMP,
      @"openURL"
    );
    RNKakaoInstallHandler(
      cls,
      @selector(application:continueUserActivity:restorationHandler:),
      (IMP)RNKakaoSignin_continueUserActivity,
      "B@:@@@@",
      RNKakaoStoreUserActivityIMP,
      @"continueUserActivity"
    );
  }

  free(classes);
}

@end
