FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22

ENV NODE_ENV=production
ENV TZ="Europe/Oslo"

WORKDIR /app

# Install pnpm directly
RUN npm install -g pnpm

# Copy workspace files needed for dependency install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/intern/package.json apps/intern/

# Install ONLY production deps for intern
RUN pnpm install --filter=intern --prod --frozen-lockfile

# Copy built output (already built in CI)
COPY apps/intern/dist apps/intern/dist

CMD ["node", "apps/intern/dist/server/server.js"]