#!/bin/bash

# iOS + Android 빌드 캐시 전체 리셋

source "$(dirname "$0")/_common.sh"
setup_error_trap

# 옵션 전달
SKIP_PODS_FLAG=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-pods) SKIP_PODS_FLAG="--skip-pods" ;;
        *) log_warn "알 수 없는 옵션: $1" ;;
    esac
    shift
done

if [[ "$OSTYPE" != "darwin"* ]]; then
    log_error "macOS에서만 실행 가능합니다."
    exit 1
fi

echo ""
echo "전체 빌드 캐시 리셋 시작"
echo ""

bash "$SCRIPT_DIR/reset-device-ios.sh" $SKIP_PODS_FLAG
bash "$SCRIPT_DIR/reset-device-android.sh"

echo "✅ 전체 리셋 완료!"
echo ""
