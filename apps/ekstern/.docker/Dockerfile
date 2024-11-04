FROM gcr.io/distroless/nodejs22-debian12
ENV NODE_ENV=production

ENV TZ="Europe/Oslo"

WORKDIR /app
COPY /dist .
COPY package.json .
COPY node_modules/ node_modules/




CMD ["/nodejs/bin/node", "server/server.js"]
