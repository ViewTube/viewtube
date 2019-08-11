<template>
  <div class="watch">
    <vue-headful v-bind:title="video.title + ' - ViewTube'" />
    <Spinner class="centered" v-if="loading"></Spinner>
    <VideoPlayer v-if="!loading" v-bind:key="video.id" v-bind:video="video"></VideoPlayer>
    <div class="video-infobox" v-if="!loading">
      <h1 class="video-infobox-title">{{ video.title }}</h1>
      <div class="video-infobox-stats">
        <p class="infobox-views">{{ video.viewCount.toLocaleString() }} views</p>
        <div class="infobox-likes">
          <ThumbsUp class="thumbs-icon"></ThumbsUp>
          <p class="like-count">{{ video.likeCount.toLocaleString() }}</p>
        </div>
        <div class="infobox-dislikes">
          <ThumbsDown class="thumbs-icon"></ThumbsDown>
          <p class="dislike-count">{{ video.dislikeCount.toLocaleString() }}</p>
        </div>
      </div>
      <div class="video-infobox-channel">
        <div class="infobox-channel-image">
          <a href="#">
            <img id="channel-img" alt="channel image" v-bind:src="video.authorThumbnails[2].url" />
          </a>
        </div>
        <div class="infobox-channel-info">
          <a href="#" class="infobox-channel-name ripple">{{ video.author }}</a>
          <p class="infobox-channel-subcount">{{ video.subCountText }} Subscribers</p>
        </div>
      </div>
      <div class="video-infobox-date">{{ video.publishedText }}</div>
      <p>tags:</p>
      <div class="video-infobox-tags">
        <span
          class="video-infobox-tag"
          v-for="keyword in video.keywords"
          v-bind:key="keyword"
        >{{ keyword }}</span>
      </div>
      <div class="video-infobox-description" v-html="video.descriptionHtml"></div>
    </div>
  </div>
</template>

<script>
import Constants from '@/const.js'
import Spinner from '@/components/Spinner'
import ThumbsUp from 'icons/ThumbUp'
import ThumbsDown from 'icons/ThumbDown'
import VideoPlayer from '@/components/VideoPlayer'

export default {
  name: 'watch',
  components: {
    Spinner,
    ThumbsUp,
    ThumbsDown,
    VideoPlayer
  },
  data: function () {
    return {
      video: [],
      loading: true,
      test: 'asd'
    }
  },
  mounted: function () {
    let videoId = this.$route.query.v
    fetch(`${Constants.apiUrl}videos/${videoId}`)
      .then(response => response.json())
      .then(data => {
        this.video = data
        this.loading = false
      })
      .catch(error => {
        return error
      })
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
        background-color: $bgcolor-alt;
        padding: 3px;
        margin: 2px;
        border-radius: 3px;
        display: inline-block;
      }
    }

    .video-infobox-stats {
      display: flex;
      flex-direction: row;
      margin: 0 0 20px 0;

      .infobox-views {
        color: $subtitle-color;
        font-family: $default-font;
        margin: 0 30px 0 0;
        font-size: 1.1rem;
      }

      .infobox-likes,
      .infobox-dislikes {
        color: $subtitle-color;
        font-family: $default-font;
        display: flex;
        flex-direction: row;
        margin: 0 30px 0 0;

        .thumbs-icon {
          width: 2rem;
        }

        p {
          text-align: center;
        }
      }
    }

    .video-infobox-channel {
      display: flex;
      flex-direction: row;

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

        .infobox-channel-name {
          text-decoration: none;
          color: $title-color;
          font-family: $default-font;
        }

        .infobox-channel-subcount {
          color: $subtitle-color;
          font-family: $default-font;
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
        text-decoration: underline;
        color: $title-color;
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
