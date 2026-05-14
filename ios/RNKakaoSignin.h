#import <Foundation/Foundation.h>

@class RNKakaoSignin;

@interface RNKakaoSignin : NSObject
+ (BOOL)isKakaoTalkLoginUrl:(NSURL *)url;   // 콜백 URL 체크
+ (BOOL)handleOpenUrl:(NSURL *)url;         // 콜백 URL > SDK로 전달
@end
