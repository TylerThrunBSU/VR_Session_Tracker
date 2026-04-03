#!/usr/bin/env bash
# fancy.sh - output helpers for dev.sh

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

fancy_box() {
  local title="$1"
  local width=52
  local line
  printf "${CYAN}┌"
  printf '─%.0s' $(seq 1 $width)
  printf "┐${RESET}\n"
  printf "${CYAN}│${RESET} ${BOLD}%-${width}s${CYAN}│${RESET}\n" "$title"
  printf "${CYAN}├"
  printf '─%.0s' $(seq 1 $width)
  printf "┤${RESET}\n"
}

fancy_box_end() {
  local width=52
  printf "${CYAN}└"
  printf '─%.0s' $(seq 1 $width)
  printf "┘${RESET}\n"
}

fancy_row() {
  local cmd="$1"
  local desc="$2"
  printf "${CYAN}│${RESET}  ${GREEN}%-12s${RESET} %-38s${CYAN}│${RESET}\n" "$cmd" "$desc"
}

fancy_sep() {
  local width=52
  printf "${CYAN}├"
  printf '─%.0s' $(seq 1 $width)
  printf "┤${RESET}\n"
}

log_info()    { echo -e "${CYAN}[INFO]${RESET}  $1"; }
log_ok()      { echo -e "${GREEN}[OK]${RESET}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${RESET} $1"; }
