FROM alpine:3.13
WORKDIR /home/app

RUN apk upgrade --no-cache -U && \
    apk add --no-cache nodejs-current yarn

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile --link-duplicates --ignore-optional && \
    yarn cache clean && \
    yarn modclean -n default:safe -r

COPY . .

RUN yarn build

ENV NODE_ENV=production
EXPOSE 8066

CMD ["node", "-r", "module-alias/register", "dist/server/main.js"]