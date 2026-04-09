#!/usr/bin/env bash

set -euo pipefail

export LANG=en_US.UTF-8

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly APP_DIR="$PROJECT_ROOT"

log_warn() {
    if [ -t 1 ]; then
        echo -e "${YELLOW}[WARN]${NC} $1"
    else
        echo "[WARN] $1"
    fi
}

log_error() {
    if [ -t 1 ]; then
        echo -e "${RED}[ERROR]${NC} $1"
    else
        echo "[ERROR] $1"
    fi
}

log_success() {
    if [ -t 1 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} $1"
    else
        echo "[SUCCESS] $1"
    fi
}

setup_error_trap() {
    trap 'log_error "스크립트 실행 중 오류가 발생했습니다. (line $LINENO)"; exit 1' ERR
}

run_task() {
    local task_name="$1"
    shift

    echo "• ${task_name}"
    "$@"
    log_success "${task_name} 완료"
}
