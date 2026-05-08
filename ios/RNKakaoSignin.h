#import <Foundation/Foundation.h>

@class RNKakaoSignin;

@interface RNKakaoSignin : NSObject
+ (BOOL)isKakaoTalkLoginUrl:(NSURL *)url;
+ (BOOL)handleOpenUrl:(NSURL *)url;
@end
