FROM node:16-alpine3.13 as build
WORKDIR /home/build

ENV BUILD_ENV=production

COPY package.json yarn.lock prepare.js ./
RUN yarn install --pure-lockfile --link-duplicates --ignore-optional

COPY . .

RUN yarn build

RUN rm -rf node_modules server scripts shared types

FROM alpine:3.14 as runtime
WORKDIR /home/app

COPY --from=build /home/build .

RUN apk add --no-cache nodejs-current

RUN apk add --no-cache --virtual .build-deps yarn && \
    yarn install --pure-lockfile --link-duplicates --ignore-optional --non-interactive --production && \
    yarn cache clean && \
    yarn modclean -n default:safe -r && \
    apk del .build-deps

ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=20s --start-period=60s CMD wget --no-verbose --tries=3 --spider http://localhost:8066/ || exit 1
EXPOSE 8066

CMD ["node", "-r", "module-alias/register", "dist/server/main.js"]