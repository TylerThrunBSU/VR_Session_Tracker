#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/fancy.sh"

# ── Config (override via .env) ──────────────────────────
ENV_FILE=".env"
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

APP_NAME="${APP_NAME:-vr-session-tracker}"
APP_VERSION="${APP_VERSION:-latest}"
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-~/.ssh/id_rsa}"
APP_PORT="${APP_PORT:-3000}"

IMAGE_NAME="${DOCKER_USERNAME}/${APP_NAME}:${APP_VERSION}"
COMPOSE_FILE="docker-compose.yml"

# ── Help ─────────────────────────────────────────────────
cmd_help() {
  fancy_box "VR Session Tracker - dev.sh"
  fancy_row "env, e"     "Show current environment config"
  fancy_row "new, n"     "Install packages on a fresh EC2 instance"
  fancy_row "login, l"   "Log in to Docker Hub"
  fancy_row "docker, dk" "Show Docker status (images + containers)"
  fancy_row "ec2, ec"    "Show EC2 connection info"
  fancy_row "init, i"    "Initialize Docker buildx"
  fancy_row "up, u"      "Start app with Docker Compose"
  fancy_row "down, d"    "Stop and remove containers"
  fancy_row "build, b"   "Build Docker image"
  fancy_row "push, p"    "Push image to Docker Hub"
  fancy_row "deploy, y"  "Build + push + deploy to EC2"
  fancy_row "logs, lg"   "Tail container logs"
  fancy_row "web, w"     "Print the app URL"
  fancy_row "open-web,ow" "Open app in browser"
  fancy_row "ssh, s"     "SSH into EC2 instance"
  fancy_row "all, a"     "new + build + up (full local setup)"
  fancy_row "clean, c"   "Remove containers and local data"
  fancy_row "nuke, x"    "Remove containers, images, and data"
  fancy_row "help, h"    "Show this help message"
  fancy_box_end
}

# ── Commands ─────────────────────────────────────────────
cmd_env() {
  log_info "Environment config:"
  echo "  APP_NAME      = $APP_NAME"
  echo "  APP_VERSION   = $APP_VERSION"
  echo "  DOCKER_USER   = ${DOCKER_USERNAME:-<not set>}"
  echo "  EC2_HOST      = ${EC2_HOST:-<not set>}"
  echo "  EC2_USER      = $EC2_USER"
  echo "  APP_PORT      = $APP_PORT"
}

cmd_new() {
  log_info "Installing packages on EC2..."
  if [ -z "$EC2_HOST" ]; then log_error "EC2_HOST not set in .env"; exit 1; fi
  ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" << 'REMOTE'
    set -e
    sudo apt-get update -q
    sudo apt-get install -y docker.io docker-compose-plugin curl
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "Packages installed."
REMOTE
  log_ok "EC2 setup complete."
}

cmd_login() {
  log_info "Logging in to Docker Hub..."
  docker login
}

cmd_docker() {
  log_info "Docker images:"
  docker images
  echo ""
  log_info "Docker containers:"
  docker ps -a
}

cmd_ec2() {
  log_info "EC2 connection info:"
  echo "  Host: ${EC2_HOST:-<not set>}"
  echo "  User: $EC2_USER"
  echo "  Key:  $EC2_KEY"
}

cmd_init() {
  log_info "Initializing Docker buildx..."
  docker buildx create --use --name multiplatform 2>/dev/null || docker buildx use multiplatform
  log_ok "Buildx ready."
}

cmd_up() {
  log_info "Starting containers..."
  docker compose -f "$COMPOSE_FILE" up -d
  log_ok "App running at http://localhost:${APP_PORT}"
}

cmd_down() {
  log_info "Stopping containers..."
  docker compose -f "$COMPOSE_FILE" down
  log_ok "Containers stopped."
}

cmd_build() {
  log_info "Building Docker image: $IMAGE_NAME"
  docker build -t "$IMAGE_NAME" ./app
  log_ok "Build complete."
}

cmd_push() {
  log_info "Pushing $IMAGE_NAME to Docker Hub..."
  docker push "$IMAGE_NAME"
  log_ok "Push complete."
}

cmd_deploy() {
  cmd_build
  cmd_push
  log_info "Deploying to EC2..."
  if [ -z "$EC2_HOST" ]; then log_error "EC2_HOST not set in .env"; exit 1; fi
  ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
    "docker pull ${IMAGE_NAME} && \
     docker stop ${APP_NAME} 2>/dev/null || true && \
     docker rm ${APP_NAME} 2>/dev/null || true && \
     docker run -d --name ${APP_NAME} --restart unless-stopped \
       -p ${APP_PORT}:3000 \
       -v /home/${EC2_USER}/data:/app/data \
       ${IMAGE_NAME}"
  log_ok "Deployed. App at http://${EC2_HOST}:${APP_PORT}"
}

cmd_logs() {
  docker compose -f "$COMPOSE_FILE" logs -f
}

cmd_web() {
  if [ -n "$EC2_HOST" ]; then
    echo "http://${EC2_HOST}:${APP_PORT}"
  else
    echo "http://localhost:${APP_PORT}"
  fi
}

cmd_open_web() {
  local url
  url=$(cmd_web)
  log_info "Opening $url"
  if command -v xdg-open &>/dev/null; then xdg-open "$url"
  elif command -v open &>/dev/null; then open "$url"
  else log_warn "Could not detect browser. Open manually: $url"; fi
}

cmd_ssh() {
  if [ -z "$EC2_HOST" ]; then log_error "EC2_HOST not set in .env"; exit 1; fi
  ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}"
}

cmd_all() {
  cmd_build
  cmd_up
  log_ok "Full setup complete."
}

cmd_clean() {
  log_warn "Stopping containers and removing local data..."
  docker compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true
  rm -rf ./app/data ./app/test-data
  log_ok "Clean complete."
}

cmd_nuke() {
  log_warn "Removing containers, images, and data..."
  docker compose -f "$COMPOSE_FILE" down -v --rmi all 2>/dev/null || true
  rm -rf ./app/data ./app/test-data
  log_ok "Nuke complete."
}

# ── Dispatch ─────────────────────────────────────────────
case "${1:-help}" in
  env|e)        cmd_env ;;
  new|n)        cmd_new ;;
  login|l)      cmd_login ;;
  docker|dk)    cmd_docker ;;
  ec2|ec)       cmd_ec2 ;;
  init|i)       cmd_init ;;
  up|u)         cmd_up ;;
  down|d)       cmd_down ;;
  build|b)      cmd_build ;;
  push|p)       cmd_push ;;
  deploy|y)     cmd_deploy ;;
  logs|lg)      cmd_logs ;;
  web|w)        cmd_web ;;
  open-web|ow)  cmd_open_web ;;
  ssh|s)        cmd_ssh ;;
  all|a)        cmd_all ;;
  clean|c)      cmd_clean ;;
  nuke|x)       cmd_nuke ;;
  help|h)       cmd_help ;;
  *)
    log_error "Unknown command: ${1}"
    echo ""
    cmd_help
    exit 1
    ;;
esac
