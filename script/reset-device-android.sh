#!/bin/bash

# Android 빌드 캐시 리셋
# build 폴더 삭제 + Gradle clean

source "$(dirname "$0")/_common.sh"
setup_error_trap

echo ""
echo "Android 빌드 캐시 리셋 시작"
echo ""

cd "$APP_DIR/android"

# 빌드 폴더 삭제
_wipe_build() {
    [ -d "build" ] && rm -rf build
    [ -d "app/build" ] && rm -rf app/build
    [ -d ".gradle" ] && rm -rf .gradle
}
run_task "빌드 폴더 삭제" _wipe_build

# Gradle clean
_gradle_clean() {
    chmod +x gradlew
    if ! ./gradlew clean &>/dev/null; then
        log_warn "Gradle clean 실패 - 계속 진행"
    fi
}
run_task "Gradle clean" _gradle_clean

echo "✅ Android reset 완료!"
echo ""
