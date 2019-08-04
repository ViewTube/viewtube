<template>
  <div class="watch">
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="video-infobox" v-if="!loading">
      <h1 class="video-infobox-title">{{ video.title }}</h1>
      <div class="video-infobox-stats">
        <p class="infobox-views"></p>
        <div class="infobox-likes">
          <ThumbsUp></ThumbsUp>
          <p class="like-count"></p>
        </div>
        <div class="infobox-dislikes">
          <ThumbsDown></ThumbsDown>
          <p class="dislike-count"></p>
        </div>
      </div>
      <div class="video-infobox-channel">
        <div class="infobox-channel-image">
          <a href="#">
            <img id="channel-img" src="#" alt="channel image" />
          </a>
        </div>
        <div class="infobox-channel-info">
          <a href="#" class="infobox-channel-name ripple">{{ author }}</a>
          <p class="infobox-channel-subcount">{{ subCountText }} Subscribers</p>
        </div>
      </div>
      <div class="video-infobox-description"></div>
    </div>
  </div>
</template>

<script>
import Constants from '@/const.js'
import Spinner from '@/components/Spinner'
import ThumbsUp from 'icons/ThumbUp'
import ThumbsDown from 'icons/ThumbDown'

export default {
  name: 'watch',
  components: {
    Spinner,
    ThumbsUp,
    ThumbsDown
  },
  data: function () {
    return {
      video: [],
      loading: true
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
      .catch((error) => {
        return error
      })
  }
}
</script>

<style lang="scss">
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

      p {
        text-align: center;
      }

      i {
        font-size: 1.2rem;
        margin: 0 5px 0 0;
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

  .video-infobox-description {
    margin: 20px 0 0 0;
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
</style>
