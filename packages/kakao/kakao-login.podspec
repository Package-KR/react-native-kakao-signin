require "json"

# RCT_NEW_ARCH_ENABLED = 1일경우, install_modules_dependencies(s) 호출
fabric_enabled = ENV["RCT_NEW_ARCH_ENABLED"] == "1"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
kakao_sdk_version = "2.22.0"

Pod::Spec.new do |s|
  s.name         = "kakao-login"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/Package-KR/RNSocialLogin"
  s.license      = "MIT"
  s.authors      = { "Package.kr" => "" }
  s.platforms    = { :ios => "13.0" }
  s.framework    = 'UIKit'
  s.source       = { :git => "https://github.com/Package-KR/RNSocialLogin.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true

  if fabric_enabled
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end

  if defined?($KakaoSDKVersion)
    kakao_sdk_version = $KakaoSDKVersion
  end

  s.dependency 'KakaoSDKCommon', kakao_sdk_version
  s.dependency 'KakaoSDKAuth', kakao_sdk_version
  s.dependency 'KakaoSDKUser', kakao_sdk_version
end
