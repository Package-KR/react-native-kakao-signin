#!/bin/sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FAILURES=""
ANDROID_AVD_NAME="${ANDROID_AVD_NAME:-S23_FE}"

printf "\n== Reset Devices ==\n"
sh "$ROOT_DIR/script/reset-device-all.sh"

run_step() {
  NAME="$1"
  DIR="$2"
  COMMAND="$3"

  printf "\n== %s ==\n" "$NAME"
  (
    cd "$DIR" || exit 1
    sh -c "$COMMAND"
  )

  STATUS=$?
  if [ "$STATUS" -ne 0 ]; then
    FAILURES="${FAILURES}
- ${NAME}"
  fi
}

stop_metro() {
  PIDS="$(/usr/sbin/lsof -ti :8081 2>/dev/null)"

  if [ -z "$PIDS" ]; then
    printf "\n8081 Metro 프로세스가 없습니다.\n"
    return
  fi

  printf "\n8081 Metro 프로세스를 종료합니다.\n"
  echo "$PIDS" | while read PID; do
    /bin/kill "$PID" 2>/dev/null || true
  done

  sleep 2

  PIDS="$(/usr/sbin/lsof -ti :8081 2>/dev/null)"

  if [ -z "$PIDS" ]; then
    printf "8081 Metro 프로세스가 종료되었습니다.\n"
    return
  fi

  printf "8081 Metro 프로세스가 남아 있어 강제 종료합니다.\n"
  echo "$PIDS" | while read PID; do
    /bin/kill -9 "$PID" 2>/dev/null || true
  done
}

ensure_android_emulator() {
  DEVICE="$("$HOME/Library/Android/sdk/platform-tools/adb" devices | /usr/bin/awk 'NR > 1 && $2 == "device" {print $1; exit}')"

  if [ -n "$DEVICE" ]; then
    printf "\nAndroid device ready: %s\n" "$DEVICE"
    return
  fi

  printf "\nAndroid emulator를 시작합니다: %s\n" "$ANDROID_AVD_NAME"
  "$HOME/Library/Android/sdk/emulator/emulator" -avd "$ANDROID_AVD_NAME" >/tmp/rnkakao-verify-emulator.log 2>&1 &

  "$HOME/Library/Android/sdk/platform-tools/adb" wait-for-device

  COUNT=0
  while [ "$COUNT" -lt 90 ]; do
    BOOTED="$("$HOME/Library/Android/sdk/platform-tools/adb" shell getprop sys.boot_completed 2>/dev/null | /usr/bin/tr -d '\r')"

    if [ "$BOOTED" = "1" ]; then
      printf "Android emulator boot completed.\n"
      return
    fi

    COUNT=$((COUNT + 1))
    sleep 2
  done

  printf "Android emulator boot timeout.\n"
  return 1
}

run_step "CLI iOS" "$ROOT_DIR/example/RNKakaoSigninCliExample" "npm run ios -- --simulator=\"iPhone 16 Pro Max\""
ensure_android_emulator
run_step "CLI Android" "$ROOT_DIR/example/RNKakaoSigninCliExample" "npm run android"

while true; do
  printf "\nCLI 작업이 끝났습니다. 8081 Metro를 종료하고 Expo 검증을 계속할까요? (y/n): "
  read ANSWER

  case "$ANSWER" in
    y|Y)
      stop_metro
      break
      ;;
    n|N)
      if [ -n "$FAILURES" ]; then
        printf "\nVerify failed:%s\n" "$FAILURES"
        exit 1
      fi

      printf "\nExpo checks skipped.\n"
      exit 0
      ;;
    *)
      printf "y 또는 n만 입력하세요.\n"
      ;;
  esac
done

run_step "Expo iOS" "$ROOT_DIR/example/RNKakaoSigninExpoExample" "npm run ios"
ensure_android_emulator
run_step "Expo Android" "$ROOT_DIR/example/RNKakaoSigninExpoExample" "npm run android"

if [ -n "$FAILURES" ]; then
  printf "\nVerify failed:%s\n" "$FAILURES"
  exit 1
fi

printf "\nVerify succeeded.\n"
