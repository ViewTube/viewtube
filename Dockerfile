FROM node:16-bullseye as build
WORKDIR /home/build

ENV NUXT_BUILD=true

COPY package.json ./
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

RUN pnpm run build

RUN rm -rf node_modules client/node_modules server/node_modules shared/node_modules "$(pnpm store path)"

RUN CI=true pnpm install --frozen-lockfile --prod --shamefully-hoist

FROM node:16-bullseye-slim as runtime
WORKDIR /home/app

ENV NODE_ENV=production

COPY --from=build /home/build/package.json ./
COPY --from=build /home/build/client/package.json ./client/
COPY --from=build /home/build/server/package.json ./server/

COPY --from=build /home/build/node_modules ./node_modules
COPY --from=build /home/build/server/node_modules ./server/node_modules

COPY --from=build /home/build/server/dist ./server/dist/

COPY --from=build /home/build/client/.output ./client/.output/

RUN \
  --mount=type=cache,target=/var/cache/apt \
  apt-get update \
  && apt-get install -y --no-install-recommends wget \
  && rm -rf /var/cache/apt/archives /var/lib/apt/lists/*

ENV VIEWTUBE_BASE_DIR=/home/app
HEALTHCHECK --interval=30s --timeout=20s --start-period=60s CMD wget --no-verbose --tries=3 --spider http://localhost:8066/ || exit 1
EXPOSE 8066

CMD ["node", "/home/app/server/dist/main.cjs"]
