SHELL := /bin/sh

.PHONY: install lint typecheck test build migrate

install:
	pnpm install --frozen-lockfile

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

build:
	pnpm build

migrate:
	pnpm prisma:migrate
