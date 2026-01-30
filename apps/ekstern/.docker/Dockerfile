FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22
ENV NODE_ENV=production

ENV TZ="Europe/Oslo"

WORKDIR /app
COPY apps/ekstern/dist .
COPY apps/ekstern/package.json .
COPY node_modules/ node_modules/
COPY ../../node_modules/ ../../node_modules/

CMD ["node", "server/server.js"]
