#!/bin/bash

# iOS 빌드 캐시 리셋
# DerivedData 삭제 + Pods 재설치

source "$(dirname "$0")/_common.sh"
setup_error_trap

# 옵션 처리
SKIP_PODS=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-pods) SKIP_PODS=true ;;
        *) log_warn "알 수 없는 옵션: $1" ;;
    esac
    shift
done

# macOS 확인
if [[ "$OSTYPE" != "darwin"* ]]; then
    log_error "macOS에서만 실행 가능합니다."
    exit 1
fi

echo ""
echo "iOS 빌드 캐시 리셋 시작"
echo ""

# DerivedData 삭제
run_task "DerivedData 삭제" \
    rm -rf ~/Library/Developer/Xcode/DerivedData

# Pods 재설치
if [ "$SKIP_PODS" = true ]; then
    log_warn "--skip-pods: Pods 단계 건너뜀"
else
    cd "$APP_DIR/ios"

    _wipe_pods() {
        [ -f "Podfile.lock" ] && rm Podfile.lock
        [ -d "Pods" ] && rm -rf Pods
    }
    run_task "Pods 폴더 삭제" _wipe_pods

    _pod_install() {
        if ! pod install --silent; then
            log_error "Pod install 실패"
            exit 1
        fi
    }
    run_task "Pod install" _pod_install
fi

echo "✅ iOS reset 완료!"
echo ""
