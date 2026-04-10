#import <UIKit/UIKit.h>
#import <objc/runtime.h>

// 카카오 로그인 URL을 체크하는 Swift 클래스
@interface RNKakaoLogin : NSObject
+ (BOOL)isKakaoTalkLoginUrl:(NSURL *)url;
+ (BOOL)handleOpenUrl:(NSURL *)url;
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

  if ([RNKakaoLogin isKakaoTalkLoginUrl:url]) {
    return [RNKakaoLogin handleOpenUrl:url];
  }

  return NO;
}

// openURL 복귀 처리
static BOOL RNKakaoLogin_openURL(id self, SEL _cmd, UIApplication *app, NSURL *url, NSDictionary *options) {
  NSLog(@"[RNKakaoLogin] openURL received: %@", url.absoluteString);

  if (RNKakaoHandleURL(url)) {
    return YES;
  }

  if (rnKakaoOriginalOpenURLIMP != NULL) {
    return rnKakaoOriginalOpenURLIMP(self, _cmd, app, url, options);
  }

  return NO;
}

// universal link 복귀 처리
static BOOL RNKakaoLogin_continueUserActivity(
  id self,
  SEL _cmd,
  UIApplication *app,
  NSUserActivity *userActivity,
  void (^restorationHandler)(NSArray<id<UIUserActivityRestoring>> *)
) {
  NSURL *url = userActivity.webpageURL;
  NSLog(@"[RNKakaoLogin] continueUserActivity received: %@", url.absoluteString);

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
    NSLog(@"[RNKakaoLogin] %@ added to %@", name, NSStringFromClass(cls));
    return;
  }

  storeOriginal(method_getImplementation(method));
  method_setImplementation(method, interceptor);
  NSLog(@"[RNKakaoLogin] %@ swizzled on %@", name, NSStringFromClass(cls));
}

// 로더
@interface RNKakaoLoginLoader : NSObject
@end

@implementation RNKakaoLoginLoader

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
      (IMP)RNKakaoLogin_openURL,
      "B@:@@@",
      RNKakaoStoreOpenURLIMP,
      @"openURL"
    );
    RNKakaoInstallHandler(
      cls,
      @selector(application:continueUserActivity:restorationHandler:),
      (IMP)RNKakaoLogin_continueUserActivity,
      "B@:@@@@",
      RNKakaoStoreUserActivityIMP,
      @"continueUserActivity"
    );
  }

  free(classes);
}

@end
