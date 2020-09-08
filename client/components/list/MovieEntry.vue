<template>
  <div class="movie-entry">
    <div class="movie-entry-background" />
    <a class="movie-entry-thmb" :href="data.link" target="_blank" rel="noreferrer noopener">
      <div class="thmb-image-container">
        <img
          class="movie-entry-thmb-image"
          :src="commons.proxyUrl + data.thumbnail"
          :alt="data.title"
        />
      </div>
      <span class="movie-entry-count">{{ data.duration }}</span>
    </a>
    <div class="movie-entry-info">
      <a
        v-tippy="data.title"
        class="movie-entry-title tooltip"
        :href="data.link"
        target="_blank"
        rel="noreferrer noopener"
        >{{ data.title }}
      </a>
      <nuxt-link
        v-tippy="data.author.name"
        class="movie-entry-channel tooltip"
        :to="{ path: '/channel/' + data.author.name }"
        >{{ data.author.name }}</nuxt-link
      >
      <p>{{ data.description }}</p>
      <div class="movie-tags">
        <span v-for="(tag, index) in data.meta" :key="index">{{ tag }}</span>
      </div>
      <div class="movie-actors">
        <span v-for="(actor, index) in data.actors" :key="index">{{ actor }}</span>
      </div>
      <p class="movie-director">{{ data.director }}</p>
    </div>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js';
import 'tippy.js/dist/tippy.css';

export default {
  name: 'MovieEntry',
  props: {
    data: Object
  },
  data: () => ({
    commons: Commons
  }),
  mounted() {}
};
</script>

<style lang="scss">
.movie-entry {
  max-width: 800px;
  display: flex;
  flex-direction: row;
  padding: 10px;
  justify-content: flex-start;
  z-index: 11;
  position: relative;
  flex-grow: 1;

  .movie-entry-background {
    position: absolute;
    height: 175px;
    top: 10px;
    left: 10px;
    width: calc(100% - 20px);
    z-index: 10;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    transition-property: box-shadow;
  }

  .movie-entry-thmb {
    height: 265px;
    width: 300px;
    overflow: hidden;
    position: relative;
    box-shadow: $max-shadow;
    z-index: 11;

    .thmb-image-container {
      position: relative;
      top: 0;
      left: 0;

      .movie-entry-thmb-image {
        width: 100%;
        display: block;
      }
    }
    .movie-entry-count {
      text-decoration: none;
      color: $video-thmb-overlay-textcolor;
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 2px 4px;
      margin: 8px 4px;
      background-color: $video-thmb-overlay-bgcolor;
      box-sizing: border-box;
      border-radius: 2px;
      font-family: $default-font;
    }
  }

  .movie-entry-info {
    padding: 10px 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: left;
    z-index: 11;

    .movie-entry-title {
      text-decoration: none;
      margin: 0;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--title-color);
      padding: 6px 0 4px 0;
    }

    .movie-entry-channel {
      text-decoration: none;
      padding: 3px 0 4px 0;
      font-size: 0.9rem;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--subtitle-color);
    }
  }

  @media screen and (max-width: $mobile-width) {
    width: calc(100% - 20px);
    margin: 10px;

    .movie-entry-thmb {
      width: 100%;
      height: 53vw;

      .thmb-image-container {
        position: relative;
        top: 0;
        left: 0;
        transform: translateY(0);

        .movie-entry-thmb-image {
          top: 0;
          transform: translateY(0px);
        }
      }
    }
  }
}
</style>
