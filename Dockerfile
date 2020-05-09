FROM node:14.2-alpine3.11
WORKDIR /home/app

COPY . .
RUN \
  apk add yarn && \
  yarn install && \
  yarn build

EXPOSE 8066
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8066
CMD ["npm", "start"]