FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/customer-portal/package.json apps/web/customer-portal/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY apps/web/customer-portal apps/web/customer-portal
RUN pnpm --filter @certisphere/customer-portal build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/customer-portal/.next/standalone ./
COPY --from=build /app/apps/web/customer-portal/.next/static apps/web/customer-portal/.next/static
COPY --from=build /app/apps/web/customer-portal/public apps/web/customer-portal/public
EXPOSE 3000
CMD ["node", "apps/web/customer-portal/server.js"]
