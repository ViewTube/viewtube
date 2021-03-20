<template>
  <div class="history-list">
    <div v-for="(video, index) in history" :key="index" class="history-entry">
      <nuxt-link :to="`/watch?v=${video.videoId}`" class="history-entry-thumbnail">
        <img
          :src="video.videoDetails.videoThumbnails[3].url"
          :alt="video.videoDetails.title"
          class="history-entry-thumbnail-img"
        />
        <div class="history-entry-progress-bar">
          <span
            class="history-entry-progress-line"
            :style="{ width: `${(video.progressSeconds / video.lengthSeconds) * 100}%` }"
          />
        </div>
      </nuxt-link>
      <div class="history-entry-content">
        <div v-tippy="video.videoDetails.title" class="history-entry-title">
          <nuxt-link :to="`/watch?v=${video.videoId}`">{{ video.videoDetails.title }}</nuxt-link>
        </div>
        <div v-tippy="video.videoDetails.author" class="history-entry-author">
          <nuxt-link :to="`/channel/${video.videoDetails.authorId}`">
            {{ video.videoDetails.author }}</nuxt-link
          >
        </div>
        <div
          v-tippy="Date(video.lastVisit).toLocaleString()"
          class="history-entry-watched-date tooltip"
        >
          Last watched: {{ humanizeDateString(video.lastVisit) }} ago
        </div>
        <div class="history-entry-watch-progress">
          Progress: {{ $formatting.getTimestampFromSeconds(video.progressSeconds) }} of
          {{ $formatting.getTimestampFromSeconds(video.lengthSeconds) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import humanizeDuration from 'humanize-duration';

export default defineComponent({
  props: {
    history: Array
  },
  setup() {
    const humanizeDateString = (dateString: string): string => {
      const now = new Date();
      const date = new Date(dateString);
      const dateMs = now.valueOf() - date.valueOf();
      return humanizeDuration(dateMs, { largest: 1 });
    };

    return {
      humanizeDateString
    };
  }
});
</script>

<style lang="scss">
.history-list {
  display: flex;
  flex-direction: column;

  .history-entry {
    display: flex;
    flex-direction: row;
    margin: 5px 0;

    .history-entry-thumbnail {
      position: relative;
      padding-right: 230px;
      padding-bottom: 129.375px;
      width: 0;

      @media screen and (max-width: $mobile-width) {
        padding-right: 160px;
        padding-bottom: 90px;
      }

      .history-entry-thumbnail-img {
        position: absolute;
        width: 100%;
      }

      .history-entry-progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: var(--line-accent-color);

        .history-entry-progress-line {
          height: 3px;
          background-image: $theme-color-primary-gradient;
          display: block;
        }
      }
    }

    .history-entry-content {
      margin: 0 0 0 10px;
      overflow: hidden;

      .history-entry-title {
        font-size: 0.9rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--title-color);
        padding: 0 0 4px 0;
      }

      .history-entry-author {
        font-size: 0.8rem;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--subtitle-color);
        padding: 3px 0 4px 0;
      }

      .history-entry-watched-date {
        font-size: 0.8rem;
        color: var(--subtitle-color-light);
      }

      .history-entry-watch-progress {
        font-size: 0.8rem;
        color: var(--subtitle-color-light);
      }
    }
  }
}
</style>
