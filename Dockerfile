FROM node:14.8-alpine
WORKDIR /home/app

COPY package.json yarn.lock ./
RUN yarn install --production --link-duplicates --ignore-optional

COPY . .

ENV NODE_ENV=production
RUN yarn build

EXPOSE 8066

CMD ["npm", "start"]