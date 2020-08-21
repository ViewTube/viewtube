<h1 align="left">ViewTube<img src=".github/images/logo.png" alt="" width="90" height="90" align="left" /></h1>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

ViewTube is an alternative YouTube frontend using the [invidio.us](https://github.com/omarroth/invidious) API.

It can recommend, play and search for videos. It saves your watch progress and you can subscribe to channels for them to appear in your subscription feed.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3c74d1eff3fe47609a4f889ec1acbdd5)](https://www.codacy.com/manual/mauriceoegerli/viewtube-vue?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mauriceoegerli/viewtube-vue&amp;utm_campaign=Badge_Grade)
[![Build Status](https://drone.oeger.li/api/badges/ViewTube/viewtube-vue/status.svg)](https://drone.oeger.li/ViewTube/viewtube-vue)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![GitHub](https://img.shields.io/github/license/mauriceoegerli/viewtube-vue)](https://github.com/mauriceoegerli/viewtube-vue)

## ![Screenshot-Homepage](.github/images/icons/question.svg) Why not just use invidio.us\?

Invidious instances can easily get rate-limited by Google. With ViewTube, you can <b>switch between instances</b>. Your subscriptions, settings, etc. are stored on your <b>ViewTube account</b>.

<table>
 <tr>
   <td valign="top">Your selected instance is slow or doesn't work? Just go to settings > instance and choose a different one!</td>
   <td><img src=".github/images/switch_instance.gif" /></td>
 </tr>
</table>

## ![Screenshot-Homepage](.github/images/icons/star.svg) Features
- Watch videos without ads or tracking
- Read comments
- Search for videos
- Subscribe to channels and see their latest uploads
- Receive push notifications for subscribed channels
- Responsive: mobile and desktop friendly

## ![Screenshot-Homepage](.github/images/icons/screenshot.svg) Screenshots

### Homepage
![Screenshot-Homepage](.github/images/screenshots/lxt1y0mk.bmp)

### Video
![Screenshot-Video](.github/images/screenshots/g2ejf7wf.bmp)

### Channel
![Screenshot-Channel](.github/images/screenshots/6j45ao5r.bmp)


## ![Screenshot-Homepage](.github/images/icons/home.svg) Host it yourself

### ![Screenshot-Homepage](.github/images/icons/docker.svg) Docker

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

### ~Linux/Windows/MacOS~ OUTDATED

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

## ![Screenshot-Homepage](.github/images/icons/people.svg) Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/cyacedev"><img src="https://avatars0.githubusercontent.com/u/46712905?v=4" width="100px;" alt=""/><br /><sub><b>cyacedev</b></sub></a><br /><a href="https://github.com/ViewTube/viewtube-vue/commits?author=cyacedev" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
