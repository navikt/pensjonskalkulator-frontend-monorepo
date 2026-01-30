# syntax=docker/dockerfile:1

ARG NODE_DEPLOY_IMG=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim

FROM ${NODE_DEPLOY_IMG}

ENV NODE_ENV=production
ENV TZ="Europe/Oslo"

WORKDIR /app

# Copy pre-built server compiled from CI
COPY apps/intern/dist/server/server.js ./server.js

# Copy client assets built from CI
COPY apps/intern/dist/assets ./assets
COPY apps/intern/dist/index.html ./
COPY apps/intern/dist/*.css ./

# Copy node_modules and pnpm store (already installed in CI)
COPY node_modules ./node_modules

CMD ["node", "--input-type=module", "server.js"]