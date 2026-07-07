# Certisphere Development Setup

This guide prepares a clean workstation or GitLab CI runner for Certisphere development and Milestone 1.2F runtime verification.

## Supported Operating Systems

- macOS 14 or later on Apple Silicon or Intel
- Ubuntu 22.04 LTS or 24.04 LTS
- Windows 11 with WSL2 Ubuntu 22.04 or 24.04

Native Windows shells are not supported for backend/runtime verification. Use WSL2 for Linux-compatible shell scripts, Docker networking, and PostgreSQL tooling.

## Required Toolchain

| Tool | Required version |
| --- | --- |
| Node.js | 22.x LTS |
| pnpm | 10.13.1 |
| Docker Engine / Docker Desktop | 27.x or later |
| Docker Compose | v2.24 or later |
| PostgreSQL client/server tools | 16.x |
| Prisma CLI | 6.19.x from the lockfile |
| Git | 2.40 or later |

## Hardware Requirements

| Resource | Minimum | Recommended |
| --- | ---: | ---: |
| CPU | 4 cores | 8 cores |
| Memory | 8 GB | 16 GB |
| Free disk | 20 GB | 40 GB |

Docker image builds, Next.js production builds, Prisma engines, and package caches require meaningful free disk space. Keep at least 20 GB free before running release verification.

## Environment Variables

Create `.env` from `.env.example` and replace placeholder secrets.

Required:

- `DATABASE_URL`
- `REDIS_URL`
- `API_PORT`
- `JWT_ACCESS_TOKEN_SECRET`
- `IDENTITY_BOOTSTRAP_TOKEN`

`JWT_ACCESS_TOKEN_SECRET` and `IDENTITY_BOOTSTRAP_TOKEN` must each be at least 32 characters.

## macOS

1. Install Xcode Command Line Tools.

   ```bash
   xcode-select --install
   ```

2. Install Homebrew from [https://brew.sh](https://brew.sh).

3. Install tooling.

   ```bash
   brew install node@22 pnpm postgresql@16 git
   brew install --cask docker
   ```

4. Start Docker Desktop and wait until it reports that Docker is running.

5. Prepare the repository.

   ```bash
   cp .env.example .env
   ./scripts/bootstrap
   ```

6. Start the development stack.

   ```bash
   ./scripts/start-dev
   ```

## Ubuntu

1. Install base packages.

   ```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg git postgresql-client-16
   ```

2. Install Node.js 22.

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   corepack enable
   corepack prepare pnpm@10.13.1 --activate
   ```

3. Install Docker Engine and Compose using Docker's official Ubuntu instructions.

   See [https://docs.docker.com/engine/install/ubuntu/](https://docs.docker.com/engine/install/ubuntu/).

4. Allow your user to use Docker, then sign out and back in.

   ```bash
   sudo usermod -aG docker "$USER"
   ```

5. Prepare the repository.

   ```bash
   cp .env.example .env
   ./scripts/bootstrap
   ```

6. Start the development stack.

   ```bash
   ./scripts/start-dev
   ```

## Windows

1. Install Windows 11 updates.

2. Install WSL2 with Ubuntu.

   ```powershell
   wsl --install -d Ubuntu-24.04
   ```

3. Install Docker Desktop for Windows and enable WSL integration for the Ubuntu distribution.

4. Open Ubuntu in WSL2 and follow the Ubuntu Node.js, pnpm, PostgreSQL client, and Git setup steps above.

5. Clone the repository inside the WSL2 filesystem, not under `/mnt/c`, for reliable file watching and Docker performance.

6. Prepare the repository.

   ```bash
   cp .env.example .env
   ./scripts/bootstrap
   ```

7. Start the development stack.

   ```bash
   ./scripts/start-dev
   ```

## Verification Commands

Run:

```bash
./scripts/verify-environment
./scripts/doctor
pnpm typecheck
pnpm lint
pnpm test
pnpm test:integration
pnpm build
```

Milestone 1.2F release verification must run on a machine or GitLab runner where Docker, Docker Compose, and PostgreSQL tooling are available.
