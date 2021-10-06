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

COPY --from=build /home/build/.yarn/releases ./.yarn/releases/
COPY --from=build /home/build/.yarn/plugins ./.yarn/plugins/
COPY --from=build /home/build/.yarn/sdks ./.yarn/sdks/
COPY --from=build /home/build/package.json /home/build/yarn.lock /home/build/.yarnrc.yml ./

COPY --from=build /home/build/server/package.json ./server/package.json
COPY --from=build /home/build/server/dist ./server/dist

RUN cat ./server/package.json

COPY --from=build /home/build/client/package.json ./client/package.json
COPY --from=build /home/build/client/dist ./client/dist

RUN apk add --no-cache nodejs-current

RUN apk add --no-cache --virtual .build-deps yarn && \
    yarn workspaces focus server --production && \
    yarn cache clean --mirror && \
    apk del .build-deps

ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=20s --start-period=60s CMD wget --no-verbose --tries=3 --spider http://localhost:8066/ || exit 1
EXPOSE 8066

CMD ["node", "-r", "/home/app/.pnp.cjs", "/home/app/server/dist/server/main.js"]
