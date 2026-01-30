# syntax=docker/dockerfile:1

ARG NODE_DEPLOY_IMG=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim

FROM ${NODE_DEPLOY_IMG}

ENV NODE_ENV=production
ENV TZ="Europe/Oslo"

# Copy node_modules to root so symlink paths work correctly
COPY node_modules /node_modules

# Copy pre-built server and assets
WORKDIR /app
COPY apps/intern/dist/server/server.js ./server.js
COPY apps/intern/dist/assets ./assets
COPY apps/intern/dist/index.html ./
COPY apps/intern/dist/*.css ./

ENTRYPOINT ["/usr/local/bin/node"]
CMD ["--input-type=module", "server.js"]