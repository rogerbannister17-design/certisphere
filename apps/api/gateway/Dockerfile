FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/gateway/package.json apps/api/gateway/package.json
COPY packages packages
COPY services services
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY apps/api/gateway apps/api/gateway
RUN pnpm --filter @certisphere/api-gateway build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/gateway/dist apps/api/gateway/dist
COPY --from=dependencies /app/node_modules node_modules
COPY --from=dependencies /app/apps/api/gateway/package.json apps/api/gateway/package.json
EXPOSE 3001
CMD ["node", "apps/api/gateway/dist/main.js"]
