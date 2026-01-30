FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22

ENV NODE_ENV=production
ENV TZ="Europe/Oslo"

WORKDIR /app

# Install pnpm
RUN npm install pnpm@9.15.4


COPY package.json pnpm-lock.yaml ./

RUN npx pnpm install --filter=intern... --prod --frozen-lockfile

# Copy built output (already built in CI)
COPY apps/intern/dist apps/intern/dist

CMD ["server/server.js"]