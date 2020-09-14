FROM node:14.8-alpine
WORKDIR /home/app

COPY package.json yarn.lock ./
RUN yarn install --link-duplicates --ignore-optional

COPY . .

RUN yarn build

EXPOSE 8066
ENV NODE_ENV=production

CMD ["npm", "start"]