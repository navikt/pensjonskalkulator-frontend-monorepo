# syntax=docker/dockerfile:1

ARG NODE_DEPLOY_IMG=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22.12-slim

FROM ${NODE_DEPLOY_IMG} AS runtime-deps

WORKDIR /workspace
COPY . .

RUN corepack enable \
  && pnpm install --frozen-lockfile \
  && pnpm --filter=@pensjonskalkulator-frontend-monorepo/ekstern deploy --prod --legacy --strict-peer-dependencies=false /runtime

FROM ${NODE_DEPLOY_IMG}

ENV NODE_ENV=production
ENV TZ="Europe/Oslo"

WORKDIR /app

COPY --from=runtime-deps /runtime/package.json ./package.json
COPY --from=runtime-deps /runtime/node_modules ./node_modules

COPY apps/ekstern/dist/server/server.js ./server.js
COPY apps/ekstern/dist/server/ensureEnv.js ./ensureEnv.js
COPY apps/ekstern/dist/assets ./assets
COPY apps/ekstern/dist/index.html ./
COPY apps/ekstern/dist/veileder/index.html ./veileder/index.html
COPY apps/ekstern/dist/*.css ./

ENTRYPOINT ["node"]
CMD ["server.js"]
