FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22
ENV NODE_ENV=production

ENV TZ="Europe/Oslo"

WORKDIR /app
COPY dist .
COPY package.json .
COPY node_modules/ node_modules/

CMD ["node", "server/server.js"]
