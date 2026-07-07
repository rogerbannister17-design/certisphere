#!/usr/bin/env sh
set -eu

MIN_NODE_MAJOR=22
MIN_PNPM_MAJOR=10
MIN_DOCKER_MAJOR=27
MIN_COMPOSE_MAJOR=2
MIN_POSTGRES_MAJOR=16
MIN_GIT_MAJOR=2
MIN_DISK_GB=20
MIN_MEMORY_MB=8192
MIN_CPU_CORES=4

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf 'PASS %s\n' "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf 'FAIL %s\n' "$1"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  printf 'WARN %s\n' "$1"
}

section() {
  printf '\n%s\n' "$1"
}

finish_report() {
  printf '\nSummary: %s pass, %s warn, %s fail\n' "$PASS_COUNT" "$WARN_COUNT" "$FAIL_COUNT"
  [ "$FAIL_COUNT" -eq 0 ]
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

first_number() {
  printf '%s\n' "$1" | sed -n 's/[^0-9]*\([0-9][0-9]*\).*/\1/p' | head -n 1
}

check_major_at_least() {
  label="$1"
  version_output="$2"
  minimum="$3"
  major="$(first_number "$version_output")"

  if [ -z "$major" ]; then
    fail "$label version could not be parsed from: $version_output"
    return
  fi

  if [ "$major" -ge "$minimum" ]; then
    pass "$label version $version_output"
  else
    fail "$label version $version_output is below required major $minimum"
  fi
}

load_dotenv() {
  if [ -f ".env" ]; then
    set -a
    # shellcheck disable=SC1091
    . ./.env
    set +a
  fi
}

check_node() {
  if command_exists node; then
    check_major_at_least "Node.js" "$(node --version)" "$MIN_NODE_MAJOR"
  else
    fail "Node.js is not installed or not on PATH"
  fi
}

check_pnpm() {
  if command_exists pnpm; then
    check_major_at_least "pnpm" "$(pnpm --version)" "$MIN_PNPM_MAJOR"
  else
    fail "pnpm is not installed or not on PATH"
  fi
}

check_git() {
  if command_exists git; then
    check_major_at_least "Git" "$(git --version)" "$MIN_GIT_MAJOR"
  else
    fail "Git is not installed or not on PATH"
  fi
}

check_docker() {
  if command_exists docker; then
    check_major_at_least "Docker" "$(docker --version)" "$MIN_DOCKER_MAJOR"
    if docker info >/dev/null 2>&1; then
      pass "Docker daemon is reachable"
    else
      fail "Docker is installed but the daemon is not reachable"
    fi
  else
    fail "Docker is not installed or not on PATH"
  fi
}

compose_command() {
  if command_exists docker && docker compose version >/dev/null 2>&1; then
    printf 'docker compose'
    return 0
  fi

  if command_exists docker-compose; then
    printf 'docker-compose'
    return 0
  fi

  return 1
}

run_compose() {
  if command_exists docker && docker compose version >/dev/null 2>&1; then
    docker compose "$@"
    return
  fi

  if command_exists docker-compose; then
    docker-compose "$@"
    return
  fi

  printf 'Docker Compose is not installed or not on PATH\n' >&2
  return 127
}

check_docker_compose() {
  if command_exists docker && docker compose version >/dev/null 2>&1; then
    check_major_at_least "Docker Compose" "$(docker compose version)" "$MIN_COMPOSE_MAJOR"
  elif command_exists docker-compose; then
    check_major_at_least "Docker Compose" "$(docker-compose --version)" "$MIN_COMPOSE_MAJOR"
  else
    fail "Docker Compose v2 is not installed or not on PATH"
  fi
}

check_postgresql() {
  if command_exists psql; then
    check_major_at_least "PostgreSQL client" "$(psql --version)" "$MIN_POSTGRES_MAJOR"
  else
    fail "PostgreSQL client psql is not installed or not on PATH"
  fi
}

check_prisma() {
  if command_exists pnpm; then
    if pnpm --filter @certisphere/database exec prisma --version >/tmp/certisphere-prisma-version.txt 2>/dev/null; then
      prisma_version_line="$(grep '^prisma[[:space:]]*:' /tmp/certisphere-prisma-version.txt | head -n 1 || true)"
      check_major_at_least "Prisma" "$prisma_version_line" 6
    else
      fail "Prisma CLI is not available through pnpm"
    fi
  else
    fail "Prisma cannot be checked because pnpm is missing"
  fi
}

disk_available_gb() {
  df -Pk . | awk 'NR == 2 { printf "%d", $4 / 1024 / 1024 }'
}

check_disk() {
  available_gb="$(disk_available_gb)"
  if [ "$available_gb" -ge "$MIN_DISK_GB" ]; then
    pass "Disk space ${available_gb}GB available"
  else
    fail "Disk space ${available_gb}GB available; ${MIN_DISK_GB}GB required"
  fi
}

memory_mb() {
  if command_exists sysctl; then
    bytes="$(sysctl -n hw.memsize 2>/dev/null || printf '')"
    if [ -n "$bytes" ]; then
      awk "BEGIN { printf \"%d\", $bytes / 1024 / 1024 }"
      return
    fi
  fi

  if [ -r /proc/meminfo ]; then
    awk '/MemTotal/ { printf "%d", $2 / 1024 }' /proc/meminfo
    return
  fi

  printf '0'
}

check_memory() {
  total_mb="$(memory_mb)"
  if [ "$total_mb" -ge "$MIN_MEMORY_MB" ]; then
    pass "Memory ${total_mb}MB available"
  else
    fail "Memory ${total_mb}MB available; ${MIN_MEMORY_MB}MB required"
  fi
}

cpu_cores() {
  if command_exists getconf; then
    cores="$(getconf _NPROCESSORS_ONLN 2>/dev/null || printf '')"
    if [ -n "$cores" ]; then
      printf '%s' "$cores"
      return
    fi
  fi

  if command_exists sysctl; then
    sysctl -n hw.ncpu 2>/dev/null || printf '0'
    return
  fi

  printf '0'
}

check_cpu() {
  cores="$(cpu_cores)"
  if [ "$cores" -ge "$MIN_CPU_CORES" ]; then
    pass "CPU cores $cores available"
  else
    fail "CPU cores $cores available; $MIN_CPU_CORES required"
  fi
}

check_required_env() {
  load_dotenv

  required="DATABASE_URL REDIS_URL API_PORT JWT_ACCESS_TOKEN_SECRET IDENTITY_BOOTSTRAP_TOKEN"
  for name in $required; do
    value="$(eval "printf '%s' \"\${$name:-}\"")"
    if [ -n "$value" ]; then
      pass "Environment variable $name is set"
    else
      fail "Environment variable $name is missing; create .env from .env.example"
    fi
  done

  for secret_name in JWT_ACCESS_TOKEN_SECRET IDENTITY_BOOTSTRAP_TOKEN; do
    secret_value="$(eval "printf '%s' \"\${$secret_name:-}\"")"
    if [ -n "$secret_value" ] && [ "${#secret_value}" -ge 32 ]; then
      pass "Environment variable $secret_name length is valid"
    else
      fail "Environment variable $secret_name must be at least 32 characters"
    fi
  done
}

check_compose_services() {
  if ! compose_command >/dev/null 2>&1; then
    fail "Docker Compose services cannot be checked because Compose is unavailable"
    return
  fi

  services="$(run_compose config --services 2>/dev/null || printf '')"
  for service in postgres redis api-gateway customer-portal; do
    if printf '%s\n' "$services" | grep -qx "$service"; then
      pass "Docker Compose service $service is configured"
    else
      fail "Docker Compose service $service is missing"
    fi
  done
}
