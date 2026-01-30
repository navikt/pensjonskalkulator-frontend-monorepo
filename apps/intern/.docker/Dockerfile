# syntax=docker/dockerfile:1

ARG NODE_BUILD_IMG=node:22-alpine
ARG NODE_DEPLOY_IMG=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim

#########################################
# PREPARE DEPS FOR BUILD
#########################################
FROM --platform=${BUILDPLATFORM} ${NODE_BUILD_IMG} AS prepare
WORKDIR /usr/src/app
COPY [".npmrc", "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "./"]
COPY packages packages
COPY apps apps
RUN find apps \! -name "package.json" -mindepth 2 -maxdepth 2 -print | xargs rm -rf
RUN find packages \! -name "package.json" -mindepth 2 -maxdepth 2 -print | xargs rm -rf

#########################################
# BUILDER IMAGE - INSTALL PACKAGES AND COPY SOURCE
#########################################
FROM --platform=${BUILDPLATFORM} ${NODE_BUILD_IMG} AS builder
WORKDIR /usr/src/app
RUN apk fix \
    && apk add --no-cache --update libc6-compat \
    && rm -rf /var/cache/apk/*
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN npm install -g pnpm@9.15.4
COPY --from=prepare /usr/src/app ./

RUN pnpm install --frozen-lockfile
COPY . .

#########################################
# BUILD SERVER
#########################################
FROM --platform=${BUILDPLATFORM} builder AS server-build
WORKDIR /usr/src/app/apps/intern
RUN pnpm exec tsc -p tsconfig.server.json

#########################################
# BUILD CLIENT
#########################################
FROM --platform=${BUILDPLATFORM} builder AS client
WORKDIR /usr/src/app/apps/intern
RUN pnpm exec vite build
RUN mv dist /build-dist

#########################################
# DEPLOYMENT IMAGE
#########################################
FROM ${NODE_DEPLOY_IMG}

ENV NODE_ENV=production
ENV TZ="Europe/Oslo"

COPY --from=server-build /usr/src/app/apps/intern/dist/server/server.js /app/server.js
COPY --from=client /build-dist /app
WORKDIR /app

CMD ["node", "--input-type=module", "server.js"]