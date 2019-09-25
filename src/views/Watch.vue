<template>
  <div class="watch">
    <vue-headful
      :title="(video.title !== undefined ? video.title : 'loading') + ' - ViewTube'"
      :keywords="video.keywords !== undefined ? video.keywords.toString(): ''"
      :description="commons.description"
      :image="(video.videoThumbnails !== undefined ? video.videoThumbnails[0].url : '#')"
      lang="en"
    />
    <Spinner class="centered" v-if="loading"></Spinner>
    <VideoPlayer v-if="!loading" :key="video.id" :video="video"></VideoPlayer>
    <div class="video-infobox" v-if="!loading">
      <h1 class="video-infobox-title">{{ video.title }}</h1>
      <div class="video-infobox-stats">
        <p class="infobox-views">{{ video.viewCount.toLocaleString() }} views</p>
        <div class="infobox-rating">
          <div class="infobox-likecount">
            <div class="infobox-likes">
              <ThumbsUp class="thumbs-icon"></ThumbsUp>
              <p class="like-count">{{ video.likeCount.toLocaleString() }}</p>
            </div>
            <div class="infobox-dislikes">
              <ThumbsDown class="thumbs-icon"></ThumbsDown>
              <p class="dislike-count">{{ video.dislikeCount.toLocaleString() }}</p>
            </div>
          </div>
          <div class="like-ratio">
            <div
              class="like-ratio-bar"
              :style="{ width: (video.likeCount / (video.dislikeCount + video.likeCount)) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
      <div class="video-infobox-channel">
        <div class="infobox-channel">
          <div class="infobox-channel-image">
            <router-link :to="`channel/${video.authorId}`">
              <img id="channel-img" alt="channel image" :src="video.authorThumbnails[2].url" />
            </router-link>
          </div>
          <div class="infobox-channel-info">
            <router-link
              :to="`channel/${video.authorId}`"
              class="infobox-channel-name ripple"
            >{{ video.author }}</router-link>
            <p class="infobox-channel-subcount">{{ video.subCountText }} Subscribers</p>
          </div>
        </div>
        <SubscribeButton class="subscribe-button-watch" />
      </div>
      <div class="video-infobox-date">{{ video.publishedText }}</div>
      <p>tags:</p>
      <div class="video-infobox-tags">
        <router-link
          class="video-infobox-tag"
          v-for="keyword in video.keywords"
          :key="keyword"
          :to="`results?search_query=${keyword}`"
          target="_blank"
        >{{ keyword }}</router-link>
      </div>
      <div class="comments-description">
        <div class="video-infobox-description" v-html="video.descriptionHtml"></div>
        <div class="comments-container">
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
import Spinner from '@/components/Spinner'
import ThumbsUp from 'icons/ThumbUp'
import ThumbsDown from 'icons/ThumbDown'
import VideoPlayer from '@/components/VideoPlayer'
import SubscribeButton from '@/components/SubscribeButton'

export default {
  name: 'watch',
  components: {
    Spinner,
    ThumbsUp,
    ThumbsDown,
    VideoPlayer,
    SubscribeButton
  },
  data: function () {
    return {
      video: [],
      loading: true,
      commons: Commons
    }
  },
  methods: {
    loadData: async function () {
      let videoId = this.$route.query.v
      if (await this.$localforage.getItem(videoId)) {
        this.video = await this.$localforage.getItem(videoId)
        this.loading = false
        console.log('loaded save', this.video)
      } else {
        fetch(`${Commons.apiUrl}videos/${videoId}`, {
          cache: 'force-cache'
        })
          .then(response => response.json())
          .then(data => {
            data.descriptionHtml = this.cleanRedirectUrls(data.descriptionHtml)
            this.video = data
            this.loading = false
          })
          .catch(error => {
            console.error(error)
          })
      }
    },
    cleanRedirectUrls: function (html) {
      let div = document.createElement('div')
      div.innerHTML = html.trim()
      Array.from(div.getElementsByTagName('a')).forEach((element, index) => {
        let hrefUrl = element.href
        let urlParams = new URLSearchParams(hrefUrl.split('?')[1])
        let newHrefUrl = ''
        if (urlParams.get('q') !== null) {
          let cleanUrl = urlParams.get('q')
          newHrefUrl = cleanUrl
          div.getElementsByTagName('a')[index].text = newHrefUrl
        } else {
          newHrefUrl = hrefUrl
        }
        if (div.getElementsByTagName('a')[index] !== undefined) {
          div.getElementsByTagName('a')[index].href = newHrefUrl
          div.getElementsByTagName('a')[index].removeAttribute('data-url')
          div.getElementsByTagName('a')[index].removeAttribute('data-target-new-window')
          div.getElementsByTagName('a')[index].removeAttribute('data-sessionlink')
          div.getElementsByTagName('a')[index].removeAttribute('rel')
        }
      })
      return div.outerHTML
    }
  },
  mounted: function () {
    this.loadData()
  }
}
</script>

<style lang="scss">
.watch {
  .video-infobox {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    padding: 10px;
    box-sizing: border-box;
    opacity: 1;
    transition: opacity 300ms $intro-easing;

    .video-infobox-title {
      color: $title-color;
      font-family: $default-font;
      font-size: 1.4rem;
      margin: 20px 0 10px 0;
    }

    .video-infobox-tags {
      margin: 5px 0 0 0;
      width: 100%;
      height: 40px;
      overflow: hidden;
      overflow-x: auto;
      white-space: nowrap;

      .video-infobox-tag {
        background-color: $bgcolor-alt-light;
        text-decoration: none;
        color: $title-color;
        padding: 3px 5px;
        margin: 2px 5px 2px 0;
        border-radius: 3px;
        display: inline-block;
        transition: background-color 200ms $intro-easing;

        &:hover {
          background-color: $bgcolor-alt;
        }
      }
    }

    .video-infobox-stats {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin: 0 0 20px 0;

      .infobox-views {
        color: $subtitle-color;
        font-family: $default-font;
        margin: 0 30px 0 0;
        font-size: 1.1rem;
      }
      .infobox-rating {
        .infobox-likecount {
          display: flex;
          flex-direction: row;

          .infobox-likes {
            margin: 0 30px 0 0;
          }

          .infobox-likes,
          .infobox-dislikes {
            color: $subtitle-color;
            font-family: $default-font;
            display: flex;
            flex-direction: row;

            .thumbs-icon {
              width: 2rem;
              height: 0.8rem;
            }

            p {
              text-align: center;
            }
          }
        }

        .like-ratio {
          width: 100%;
          height: 2px;
          background-color: $theme-color-alt;
          position: relative;
          margin: 10px 0 0 0;

          .like-ratio-bar {
            position: absolute;
            background-image: $theme-color-primary-gradient;
            height: 100%;
          }
        }
      }
    }

    .video-infobox-channel {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;

      @media screen and (max-width: $watch-break-width) {
        flex-direction: column;
        align-items: flex-start;

        .infobox-channel {
          margin: 0 0 20px 0;
          .infobox-channel-info {
            .infobox-channel-name {
              max-width: 65vw !important;
            }
          }
        }
      }

      .infobox-channel {
        display: flex;
        flex-direction: row;
        align-items: center;

        .infobox-channel-image {
          width: 50px;
          height: 50px;
          margin: 0 10px 0 0;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .infobox-channel-info {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          flex-wrap: wrap;
          margin: 0 20px 0 0;

          .infobox-channel-name {
            text-decoration: none;
            color: $title-color;
            font-family: $default-font;
            font-size: 1.2rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 45vw;
          }

          .infobox-channel-subcount {
            color: $subtitle-color;
            font-family: $default-font;
          }
        }
      }
    }

    .video-infobox-date {
      margin: 20px 0 10px 0;
    }

    .video-infobox-description {
      margin: 10px 0 0 0;
      color: $title-color;
      font-family: $default-font;
      line-height: 1.2rem;

      a {
        text-decoration: none;
        color: $theme-color-alt;
        position: relative;
        transition: background-size 300ms $dynamic-easing,
          color 300ms $intro-easing;
        background-image: $theme-color-primary-gradient;
        background-size: 0% 2px;
        background-position: 0 100%;
        background-repeat: no-repeat;

        &:hover {
          color: $theme-color;
          background-size: 100% 2px;
        }
      }

      .favicon-link {
        height: 13px;
        margin: 0 4px;
      }
    }

    &.loading {
      opacity: 0;
    }
  }
}
</style>
