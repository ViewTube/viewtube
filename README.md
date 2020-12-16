<h1 align="center">
<sub>
<img  src="https://raw.githubusercontent.com/ViewTube/viewtube-vue/stable/.github/images/logo.png"
      height="50"
      width="50">
</sub>
ViewTube
</h1>

ViewTube is an alternative YouTube frontend using the [invidio.us](https://github.com/iv-org/invidious) API.

It can recommend, play and search for videos. It saves your watch progress and you can subscribe to channels for them to appear in your subscription feed.

[![DeepScan grade](https://deepscan.io/api/teams/11097/projects/14017/branches/262917/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=11097&pid=14017&bid=262917)
[![Build Status](https://drone.oeger.li/api/badges/ViewTube/viewtube-vue/status.svg)](https://drone.oeger.li/ViewTube/viewtube-vue)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![GitHub](https://img.shields.io/github/license/mauriceoegerli/viewtube-vue)](https://github.com/ViewTube/viewtube-vue/blob/stable/LICENSE)
![Docker Image Size (tag)](https://img.shields.io/docker/image-size/mauriceo/viewtube/latest?label=docker%20image)

<h2 align="center">
<sub>
<img  src=".github/icons/star.svg"
      height="30"
      width="30">
</sub>
Features
</h2>

- Watch videos without ads or tracking
- Read comments
- Search for videos
- Subscribe to channels and see their latest uploads
- Receive push notifications for subscribed channels
- Responsive: mobile and desktop friendly

<h2 align="center">
<sub>
<img  src=".github/icons/question.svg"
      height="30"
      width="30">
</sub>
Why not just use invidio.us?
</h2>

Invidious instances can easily get rate-limited by Google. With ViewTube, you can <b>switch between instances</b>. Your subscriptions, settings, etc. are stored on your <b>ViewTube account</b>.

<table>
 <tr>
   <td valign="top">
     Your selected instance is slow or doesn't work?
     <br>
     Just go to settings > instance and choose a different one!
     <br>
     Instances are fetched from the <a href="https://github.com/iv-org/documentation/blob/master/Invidious-Instances.md">invidious wiki</a>.
   </td>
   <td><img src=".github/images/switch_instance.gif" /></td>
 </tr>
</table>

<h2 align="center">
<sub>
<img  src=".github/icons/screenshot.svg"
      height="30"
      width="30">
</sub>
Screenshots
</h2>

<h3 align="center">
Homepage
</h3>

![Screenshot-Homepage](.github/images/screenshots/lxt1y0mk.bmp)

<h3 align="center">
Video
</h3>

![Screenshot-Video](.github/images/screenshots/g2ejf7wf.bmp)

<h3 align="center">
Channel
</h3>

![Screenshot-Channel](.github/images/screenshots/6j45ao5r.bmp)

<h2 align="center">
<sub>
<img  src=".github/icons/home.svg"
      height="30"
      width="30">
</sub>
Host it yourself
</h2>

A more comprehensive installation guide is available in the [wiki](https://github.com/ViewTube/viewtube-vue/wiki/Installation)

<h3 align="center">
<sub>
<img  src=".github/icons/docker.svg"
      height="30"
      width="30">
</sub>
Docker
</h3>

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
version: '3'

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

<h2 align="center">
<sub>
<img  src=".github/icons/dev.svg"
      height="30"
      width="30">
</sub>
Development setup
</h2>

Prerequisites

- Nodejs v14.x
- Yarn 1.22
- MongoDB 4.4.x

Instructions

1.  Clone this repo

    `git clone https://github.com/ViewTube/viewtube-vue`

2.  Install dependencies

    `yarn install`

3.  Start the dev server

    `yarn serve`

4.  Visit [localhost:8066](http://localhost:8066) with a browser

Pull requests welcome!

<h2 align="center">
<sub>
<img  src=".github/icons/people.svg"
      height="30"
      width="30">
</sub>
Contributors
</h2>

Thanks goes to these wonderful people

[emoji reference](https://allcontributors.org/docs/en/emoji-key)

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/cyacedev"><img src="https://avatars0.githubusercontent.com/u/46712905?v=4" width="100px;" alt=""/><br /><sub><b>cyacedev</b></sub></a><br /><a href="https://github.com/ViewTube/viewtube-vue/commits?author=cyacedev" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ckVendrix"><img src="https://avatars2.githubusercontent.com/u/51775140?v=4" width="100px;" alt=""/><br /><sub><b>Vendrix</b></sub></a><br /><a href="https://github.com/ViewTube/viewtube-vue/commits?author=ckVendrix" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
