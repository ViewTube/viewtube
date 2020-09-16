FROM node:14.8-alpine
WORKDIR /home/app
ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --production --link-duplicates --ignore-optional && \
    yarn modclean -n default:safe -r

COPY . .

RUN yarn build

EXPOSE 8066

CMD ["npm", "start"]