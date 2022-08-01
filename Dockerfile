FROM node:16-buster as build
WORKDIR /home/build

ENV BUILD_ENV=production

COPY prepare.js package.json ./
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

RUN pnpm run build

FROM node:16-buster-slim as runtime
WORKDIR /home/app

RUN apk add --no-cache --update nodejs npm

RUN npm install -g pnpm

COPY --from=build /home/build/package.json /home/build/pnpm-lock.yaml /home/build/pnpm-workspace.yaml /home/build/.pnpmfile.cjs ./
COPY --from=build /home/build/client/package.json ./client/
COPY --from=build /home/build/server/package.json ./server/

RUN CI=true pnpm install --frozen-lockfile --prod --shamefully-hoist

COPY --from=build /home/build/server/package.json ./server/
COPY --from=build /home/build/server/dist ./server/dist/

COPY --from=build /home/build/client/.output ./client/.output/

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && rm -rf /var/lib/apt/lists/*

ENV VIEWTUBE_BASE_DIR=/home/app
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=20s --start-period=60s CMD wget --no-verbose --tries=3 --spider http://localhost:8066/ || exit 1
EXPOSE 8066

CMD ["node", "/home/app/server/dist/main.cjs"]
