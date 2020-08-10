<h1 align="left">ViewTube<img src=".github/images/logo.png" alt="" width="90" height="90" align="left" /></h1>

ViewTube is an alternative YouTube frontend using the ![invidio.us](https://github.com/omarroth/invidious) API.

It can recommend, play and search for videos. It saves your watch progress and you can subscribe to channels for them to appear in your subscription feed.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3c74d1eff3fe47609a4f889ec1acbdd5)](https://www.codacy.com/manual/mauriceoegerli/viewtube-vue?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mauriceoegerli/viewtube-vue&amp;utm_campaign=Badge_Grade)
[![Build Status](https://drone.oeger.li/api/badges/mauriceoegerli/viewtube-vue/status.svg)](https://drone.oeger.li/mauriceoegerli/viewtube-vue)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![GitHub](https://img.shields.io/github/license/mauriceoegerli/viewtube-vue)](https://github.com/mauriceoegerli/viewtube-vue)

## Why not just use invidio.us?

Invidious instances can easily get rate-limited by Google. With ViewTube, you can <b>switch between instances</b>. Your subscriptions, settings, etc. are stored on your <b>ViewTube account</b>.

<table>
 <tr>
   <td valign="top">Your selected instance is slow or doesn't work? Just go to settings > instance and choose a different one!</td>
   <td><img src=".github/images/switch_instance.gif" /></td>
 </tr>
</table>

## Screenshots

<table>
  <tr>
    <td>
      ![Screenshot-Homepage](.github/images/screenshots/lxt1y0mk.bmp)
      ![Screenshot-Video](.github/images/screenshots/g2ejf7wf.bmp)
    </td>
  </tr>
  <tr>
    <td>
     ![Screenshot-Channel](.github/images/screenshots/6j45ao5r.bmp)
    </td>
  </tr>
<table>

## Host it yourself

### Docker

Example docker command

```docker
$ docker create \
  --name=viewtube
  -p 8066:8066
  -v /path/to/data:/data \
  -e VIEWTUBE_API_URL=https://api.viewtube.io/
  --restart unless-stopped \
  mauriceo/viewtube:latest
```

Docker-compose
```yml
version: "3"

services:
  viewtube:
    container_name: viewtube
    restart: unless-stopped
    image: mauriceo/viewtube:latest
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - ./data:/data
    environment:
      - VIEWTUBE_API_URL=https://api.viewtube.io/
    ports:
      - 8066:8066
```

### Linux/Windows/MacOS

Prerequisites

 - [Node JS](https://nodejs.org) >13.x
 - [Yarn](https://yarnpkg.com)
 - [PM2](https://pm2.keymetrics.io)

 1. Clone this repository

```bash
$ git clone https://github.com/mauriceoegerli/viewtube-vue.git

$ cd viewtube-vue
```

 2. Install dependencies
```bash
$ yarn install
```

 3. Build the application
```bash
$ yarn build
```

 4. Run with PM2
```bash
$ pm2 start viewtube-pm2.json
```

 5. Visit a browser on [http://localhost:8066](http://localhost:8066)
