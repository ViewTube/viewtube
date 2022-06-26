FROM node:16-alpine3.14 as build
WORKDIR /home/build

ENV BUILD_ENV=production

COPY prepare.js package.json ./
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

RUN pnpm install

COPY . .

RUN pnpm run build

FROM alpine:3.15 as runtime
WORKDIR /home/app

RUN apk add --no-cache --update nodejs-current

COPY --from=build /home/build/node_modules/ ./node_modules/
COPY --from=build /home/build/package.json /home/build/pnpm-lock.yaml ./

COPY --from=build /home/build/server/package.json ./server/
COPY --from=build /home/build/server/dist ./server/dist/

COPY --from=build /home/build/client/.output ./client/.output/

ENV VIEWTUBE_BASE_DIR=/home/app
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=20s --start-period=60s CMD wget --no-verbose --tries=3 --spider http://localhost:8066/ || exit 1
EXPOSE 8066

CMD ["node", "/home/app/server/dist/main.cjs"]
