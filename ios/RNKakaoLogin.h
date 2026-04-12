@class RNKakaoSignin;

@interface RNKakaoSignin : NSObject
- (RNKakaoSignin *)returnSwiftClassInstance;
+ (BOOL)isKakaoTalkLoginUrl:(NSURL *)url;
+ (BOOL)handleOpenUrl:(NSURL *)url;
@end

