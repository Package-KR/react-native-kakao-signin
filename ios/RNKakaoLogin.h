@class RNKakaoLogin;

@interface RNKakaoLogin : NSObject
- (RNKakaoLogin *)returnSwiftClassInstance;
+ (BOOL)isKakaoTalkLoginUrl:(NSURL *)url;
+ (BOOL)handleOpenUrl:(NSURL *)url;
@end

