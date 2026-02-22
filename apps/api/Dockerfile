# ---- Prune ----
FROM oven/bun:1.3-alpine AS prune
RUN bun add -g turbo@2.8.9
WORKDIR /app
COPY . .
RUN turbo prune @servio/api --docker

# ---- Dependencies ----
FROM oven/bun:1.3-alpine AS deps
WORKDIR /app
COPY --from=prune /app/out/json/ .
RUN bun install --frozen-lockfile --production --ignore-scripts

# ---- Build ----
FROM oven/bun:1.3-alpine AS build
WORKDIR /app
COPY --from=prune /app/out/json/ .
RUN bun install --frozen-lockfile --ignore-scripts
COPY --from=prune /app/out/full/ .
# Build workspace packages (in dependency order) so their dist/ exists before bundling the API
WORKDIR /app/packages/types
RUN bun build --minify --outfile dist/index.js src/index.ts
WORKDIR /app/packages/emails
RUN bun build --minify --outfile dist/index.mjs src/index.ts
WORKDIR /app/apps/api
RUN bun build src/main.ts src/db/migrate.ts src/worker.ts --target=bun --outdir=dist --minify

# ---- Runtime ----
FROM oven/bun:1.3-alpine AS runtime
WORKDIR /app

COPY --from=build /app/apps/api/dist/main.js ./main.js
COPY --from=build /app/apps/api/dist/db/migrate.js ./migrate.js
COPY --from=build /app/apps/api/dist/worker.js ./worker.js
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/drizzle ./drizzle

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

COPY --from=prune /app/out/full/apps/api/start.sh ./start.sh
RUN chmod +x ./start.sh
CMD ["./start.sh"]
