FROM node:14.2-alpine3.11
WORKDIR /home/app/web

COPY package.json yarn.lock ./
RUN \
  apk add yarn && \
  yarn install

COPY . .
RUN yarn build

EXPOSE 8066
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8066
CMD ["npm", "start"]