FROM node:16-alpine3.14 as build
WORKDIR /home/build

ENV BUILD_ENV=production

COPY prepare.js package.json ./
COPY .yarn ./.yarn/
COPY yarn.lock .yarnrc.yml ./

COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

RUN yarn install 

COPY . .

RUN yarn build

RUN yarn cache clean && \
    yarn workspaces focus --all --production && \
    yarn cache clean --mirror

FROM alpine:3.14 as runtime
WORKDIR /home/app

RUN apk add --no-cache --update nodejs-current

COPY --from=build /home/build/.yarn/ ./.yarn/
COPY --from=build /home/build/.pnp.cjs /home/build/package.json /home/build/yarn.lock /home/build/.yarnrc.yml ./

COPY --from=build /home/build/server/package.json ./server/
COPY --from=build /home/build/server/dist ./server/dist/

COPY --from=build /home/build/client/package.json /home/build/client/nuxt.config.ts ./client/
COPY --from=build /home/build/client/dist ./client/dist/
COPY --from=build /home/build/client/static ./client/static/

ENV VIEWTUBE_BASE_DIR=/home/app
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=20s --start-period=60s CMD wget --no-verbose --tries=3 --spider http://localhost:8066/ || exit 1
EXPOSE 8066

CMD ["node", "-r", "/home/app/.pnp.cjs", "/home/app/server/dist/server/main.js"]
