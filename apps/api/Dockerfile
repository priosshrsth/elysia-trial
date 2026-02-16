# ---- Prune ----
FROM oven/bun:1.3-alpine AS prune
RUN bun add -g turbo
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ---- Dependencies ----
FROM oven/bun:1.3-alpine AS deps
WORKDIR /app
COPY --from=prune /app/out/json/ .
RUN bun install --frozen-lockfile --production

# ---- Build ----
FROM oven/bun:1.3-alpine AS build
WORKDIR /app
COPY --from=prune /app/out/json/ .
RUN bun install --frozen-lockfile
COPY --from=prune /app/out/full/ .
WORKDIR /app/apps/api
RUN bun build src/main.ts --target=bun --outdir=dist --minify

# ---- Runtime ----
FROM oven/bun:1.3-alpine AS runtime
WORKDIR /app

COPY --from=build /app/apps/api/dist/main.js ./main.js
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/drizzle ./drizzle

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["bun", "run", "main.js"]
