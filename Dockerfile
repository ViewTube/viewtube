FROM node:16-alpine3.14 as build
WORKDIR /home/build

ENV BUILD_ENV=production

COPY prepare.js ./
COPY package.json ./
COPY .yarn ./.yarn/
COPY yarn.lock .yarnrc.yml ./

COPY server/package.json ./server
COPY client/package.json ./client
COPY shared/package.json ./shared

RUN yarn install 

COPY . .

WORKDIR /home/build/server
RUN yarn build

WORKDIR /home/build/client
RUN yarn build

FROM alpine:3.14 as runtime
WORKDIR /home/app

COPY --from=build /home/build/server/package.json ./server/package.json
COPY --from=build /home/build/server/dist ./server/dist

COPY --from=build /home/build/client/package.json ./client/package.json
COPY --from=build /home/build/client/.nuxt ./client/.nuxt

RUN apk add --no-cache nodejs-current

RUN apk add --no-cache --virtual .build-deps yarn && \
    yarn install --production && \
    yarn cache clean --all && \
    apk del .build-deps

ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=20s --start-period=60s CMD wget --no-verbose --tries=3 --spider http://localhost:8066/ || exit 1
EXPOSE 8066

CMD ["node", "server/dist/server/main.js"]