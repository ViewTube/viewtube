FROM node:14.8-alpine
WORKDIR /home/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 8066
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8066
CMD ["npm", "start"]