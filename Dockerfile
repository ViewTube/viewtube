FROM node:14.8-alpine3.12
WORKDIR /home/app/web

COPY package.json yarn.lock ./
RUN \
  apk add yarn && \
  yarn install

COPY . .
RUN yarn build

EXPOSE 8066

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8066
CMD ["npm", "start"]