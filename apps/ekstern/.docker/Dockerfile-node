FROM node:20-alpine

ENV TZ="Europe/Oslo"

WORKDIR /app
COPY /dist .
COPY package.json .
COPY node_modules/ node_modules/




CMD ["node", "server/server.js"]
