# syntax=docker/dockerfile:1

ARG NODE_DEPLOY_IMG=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim

FROM ${NODE_DEPLOY_IMG}

ENV NODE_ENV=production
ENV TZ="Europe/Oslo"

# Copy entire node_modules structure from CI
# Root node_modules (has .pnpm store and symlinks)
COPY node_modules /node_modules

# App-level node_modules (symlinks to root)
COPY apps/ekstern/node_modules /app/node_modules

# Copy pre-built server and assets to /app
COPY apps/ekstern/package.json /app/package.json
COPY apps/ekstern/dist/server/server.js /app/server.js
COPY apps/ekstern/dist/assets /app/assets
COPY apps/ekstern/dist/index.html /app/
COPY apps/ekstern/dist/*.css /app/

ENTRYPOINT ["node"]
CMD ["/app/server.js"]
