<script setup lang="ts">
import InfoIcon from 'vue-material-design-icons/Information.vue';
import VerifiedIcon from 'vue-material-design-icons/CheckDecagram.vue';
import { useLoadingVideoInfoStore } from '@/store/loadingVideoInfo';
// import { getSecondsFromTimestamp } from 'viewtube/shared';

type VideoType = {
  author:
    | {
        name?: string;
        channelID?: string;
        bestAvatar?: {
          url?: string;
        };
        verified?: string;
      }
    | string;
  channel?: {
    name?: string;
    channelID?: string;
    url?: string;
    bestAvatar?: {
      url: string;
      width: number;
      height: number;
    };
    avatars: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  videoId?: string;
  videoID?: string;
  id?: string;
  authorVerified?: boolean;
  authorId?: string;
  authorThumbnails?: {
    url: string;
    width: number;
    height: number;
  }[];
  authorThumbnailUrl?: string;
  description?: string;
  title?: string;
  isLive?: boolean;
  live?: boolean;
  lengthSeconds?: number;
  lengthString?: string;
  richThumbnails?: {
    url: string;
    width: number;
    height: number;
  }[];
  duration?:
    | string
    | {
        text?: string;
        seconds?: number;
      };
  viewCount?: number;
  viewCountText?: string;
  views?: number;
  publishedText?: string;
  published?:
    | {
        text?: string;
        seconds?: number;
      }
    | number;
  uploadedAt?: string;
};

const props = defineProps<{
  video: VideoType;
  playlistId?: string;
  lazy?: boolean;
  hideAuthor?: boolean;
}>();

const { proxyUrl } = useImgProxy();
const { apiUrl } = useApiUrl(true);
const loadingVideoInfoStore = useLoadingVideoInfoStore();
const { $formatting: formatting } = useNuxtApp();

const localProxy = '&local=true';

const videoLinkQuery = computed(() => {
  const linkQuery: { v: string; list?: string } = {
    v: props.video.videoId ? props.video.videoId : props.video.id
  };

  if (props.playlistId) {
    linkQuery.list = props.playlistId;
  }
  return linkQuery;
});

const thumbnailTemplate = 'https://i.ytimg.com/vi/';

const videoThumbnailUrl = computed(() =>
  proxyUrl(
    `${thumbnailTemplate}${
      props.video.videoId ?? props.video.id ?? props.video.videoID
    }/sddefault.jpg${localProxy}`
  )
);

const videoThumbnailUrlXL = computed(() =>
  proxyUrl(
    `${thumbnailTemplate}${
      props.video.videoId ?? props.video.id ?? props.video.videoID
    }/hqdefault.jpg${localProxy}`
  )
);

const videoDuration = computed(() => {
  if (props.video.lengthSeconds) {
    return formatting.getTimestampFromSeconds(props.video.lengthSeconds);
  } else if (props.video.lengthString) {
    return props.video.lengthString;
  } else if (typeof props.video.duration === 'object' && props.video.duration.text !== 'N/A') {
    return props.video.duration.text;
  } else if (typeof props.video.duration === 'string') {
    return props.video.duration;
  }
});

const isVerified = computed(() => {
  return (
    props.video?.author?.['verified'] ||
    props.video.authorVerified ||
    props.video.author?.['isVerified']
  );
});

const onVideoEntryClick = () => {
  loadingVideoInfoStore.setLoadingVideoInfo(props.video);
};
</script>

<template>
  <div class="video-entry">
    <div
      v-if="!hideAuthor && (video.author || video.channel)"
      class="video-author"
      :class="{
        thumbnail:
          video.authorThumbnails?.length > 0 ||
          video.author?.['bestAvatar'] ||
          video.authorThumbnailUrl ||
          video.channel?.bestAvatar
      }"
    >
      <nuxt-link
        :to="{
          path:
            '/channel/' +
            (video.authorId ??
              (typeof video.author === 'object' && video.author?.channelID) ??
              video.channel?.channelID)
        }"
      >
        <img
          v-if="video.authorThumbnails && video.authorThumbnails.length > 0"
          class="author-thumbnail"
          :src="proxyUrl(video.authorThumbnails[1]?.url ?? video.authorThumbnails[0]?.url)"
          alt="Author thumbnail"
        />
        <img
          v-else-if="video.authorThumbnailUrl"
          class="author-thumbnail"
          :src="apiUrl + video.authorThumbnailUrl"
          alt="Author thumbnail"
        />
        <img
          v-else-if="video.author?.['bestAvatar']?.url"
          class="author-thumbnail"
          :src="proxyUrl(video.author['bestAvatar'].url)"
          alt="Author thumbnail"
        />
        <img
          v-else-if="video.channel?.bestAvatar"
          class="author-thumbnail"
          :src="proxyUrl(video.channel.bestAvatar.url)"
          alt="Author thumbnail"
        />
      </nuxt-link>
      <div class="channel-name-container">
        <nuxt-link
          v-tippy="video.author?.['name'] ?? video.author ?? video.channel?.name"
          class="video-entry-channel"
          :to="{
            path:
              '/channel/' +
              (video.authorId ??
                video.author?.['channelID'] ??
                video.channel?.channelID ??
                video.author?.['id'])
          }"
          >{{ video.author?.['name'] ?? video.author ?? video.channel?.name }}</nuxt-link
        >
        <VerifiedIcon v-if="isVerified" v-tippy="'Verified'" class="verified-icon" title="" />
      </div>
    </div>
    <div class="video-entry-background" />
    <div v-if="video.description" class="description-btn-container">
      <div v-ripple v-tippy="'Show description'" class="description-btn">
        <InfoIcon />
      </div>
    </div>
    <input v-if="video.description" id="show-description" type="checkbox" name="show-description" />
    <nuxt-link
      class="video-entry-thmb"
      :to="{
        name: 'watch',
        query: videoLinkQuery
      }"
      :class="{ 'has-description': video.description }"
      @click="onVideoEntryClick"
    >
      <div class="thmb-image-container">
        <div class="thmb-clip">
          <img
            class="video-entry-thmb-image"
            :loading="lazy ? 'lazy' : 'eager'"
            :src="videoThumbnailUrl"
            :srcset="`
              ${videoThumbnailUrl} 1x, 
              ${videoThumbnailUrl} 2x, 
              ${videoThumbnailUrlXL} 3x, 
              ${videoThumbnailUrlXL} 4x
            `"
            :alt="video.title"
          />
        </div>
        <div v-if="video.description" class="video-description-overlay">
          <p class="video-description-overlay-text">{{ video.description }}</p>
        </div>
      </div>
      <!-- Disabled temporarily, because they are very buggy -->
      <div v-if="false && video.richThumbnails" class="thmb-image-container rich-thumbnail">
        <div class="thmb-clip">
          <img
            class="video-entry-thmb-image"
            :src="proxyUrl(video.richThumbnails[0]?.url)"
            :alt="video.title"
          />
        </div>
      </div>
      <div v-if="video.isLive || video.live" class="video-live">
        <svg
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
          class="live-icon"
          fill="#fff"
        >
          <g>
            <path
              d="M16.94 6.9l-1.4 1.46C16.44 9.3 17 10.58 17 12s-.58 2.7-1.48 3.64l1.4 1.45C18.22 15.74 19 13.94 19 12s-.8-3.8-2.06-5.1zM23 12c0-3.12-1.23-5.95-3.23-8l-1.4 1.45C19.97 7.13 21 9.45 21 12s-1 4.9-2.64 6.55l1.4 1.45c2-2.04 3.24-4.87 3.24-8zM7.06 17.1l1.4-1.46C7.56 14.7 7 13.42 7 12s.6-2.7 1.5-3.64L7.08 6.9C5.78 8.2 5 10 5 12s.8 3.8 2.06 5.1zM1 12c0 3.12 1.23 5.95 3.23 8l1.4-1.45C4.03 16.87 3 14.55 3 12s1-4.9 2.64-6.55L4.24 4C2.24 6.04 1 8.87 1 12zm9-3.32v6.63l5-3.3-5-3.3z"
            />
          </g>
        </svg>
        <span class="live-text">Live</span>
      </div>
      <span v-if="video.duration" class="video-entry-length">{{ videoDuration }}</span>
    </nuxt-link>

    <div class="video-entry-info">
      <div class="video-info-text">
        <nuxt-link
          v-tippy="video.title"
          class="video-entry-title"
          :to="{
            name: 'watch',
            query: videoLinkQuery
          }"
          @click="onVideoEntryClick"
          >{{ video.title }}</nuxt-link
        >
        <div class="video-entry-stats">
          <p v-if="video.viewCountText" class="video-entry-views">
            {{ video.viewCountText }} {{ !video.viewCountText.includes('views') ? 'views' : '' }}
          </p>
          <p v-else-if="video.viewCount" class="video-entry-views">
            {{ video.viewCount?.toLocaleString('en-US') }}
            {{ video.viewCount === 1 ? 'view' : 'views' }}
          </p>
          <p v-else-if="video.views" class="video-entry-views">
            {{ video.views?.toLocaleString('en-US') }}
            {{ video.views === 1 ? 'view' : 'views' }}
          </p>
          <p class="video-entry-timestamp">
            {{ videoDuration }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.video-entry {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  z-index: 11;
  position: relative;
  min-height: 0;

  .video-author {
    padding: 0;
    height: 42px;

    &.thumbnail {
      display: flex;
      flex-direction: row;

      .channel-name-container {
        .material-design-icon {
          margin: 6px 0 0 4px;
        }
      }
    }

    .author-thumbnail {
      width: 36px;
      height: 36px;
      margin: 0 10px 0 0;
      border-radius: 25px;
    }

    .channel-name-container {
      display: flex;
      flex-direction: row;
      height: 100%;
      overflow: hidden;

      .video-entry-channel {
        text-decoration: none;
        padding: 10px 0 4px 0;

        font-size: 0.85rem;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--subtitle-color);
      }

      .verified-icon {
        width: 14px;
        height: 14px;
        top: 3px;
        margin: 8px 0 0 4px;

        .material-design-icon__svg {
          width: 14px;
          height: 14px;
        }
      }
    }
  }

  .video-entry-background {
    position: absolute;
    top: 10px;
    left: 10px;
    // background-color: #34363b;
    z-index: 10;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    transition-property: box-shadow;
  }

  &:hover {
    .description-btn-container {
      opacity: 1;
      transform: scale(1);
    }
  }

  .description-btn-container {
    position: absolute;
    top: 42px;
    right: 0;
    z-index: 12;
    width: 44px;
    height: 44px;
    padding: 10px;
    margin: 5px;
    opacity: 0;
    transform: scale(0.8);
    background-color: $video-thmb-overlay-bgcolor;
    border-radius: 5px;
    box-sizing: border-box;
    cursor: pointer;
    transition: opacity 200ms $intro-easing, transform 200ms $intro-easing;
  }

  #show-description {
    position: absolute;
    top: 42px;
    right: 2px;
    z-index: 13;
    opacity: 0;
    width: 50px;
    height: 50px;
    cursor: pointer;
  }

  #show-description:checked + .video-entry-thmb .video-entry-length {
    transform: scale(0);
  }

  #show-description:checked + .video-entry-thmb .thmb-image-container {
    &.rich-thumbnail {
      display: none;
    }
    .video-description-overlay {
      opacity: 1;
    }
  }

  .video-entry-thmb {
    position: relative;
    z-index: 11;
    box-shadow: $medium-shadow;
    overflow: hidden;
    padding-top: 56.25%;

    &:hover {
      .rich-thumbnail {
        opacity: 1 !important;
        transition: opacity 150ms 300ms $intro-easing !important;
      }
    }

    .thmb-image-container {
      position: absolute;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);

      &.rich-thumbnail {
        opacity: 0;
        transition: opacity 150ms $intro-easing;
        pointer-events: none;
      }

      .thmb-clip {
        overflow: hidden;

        .video-entry-thmb-image {
          display: block;
          max-width: 100%;
          min-width: 100%;
          transition: filter 0ms 300ms $intro-easing;
        }
      }

      .video-description-overlay {
        position: absolute;
        left: 0;
        top: 50%;
        padding-bottom: 56.25%;
        pointer-events: none;
        width: 100%;
        height: 0;
        transform: translateY(-50%);
        color: $video-thmb-overlay-textcolor;
        overflow: visible;
        background-color: #0000009f;
        box-sizing: border-box;
        font-size: 1rem;
        opacity: 0;
        transition: opacity 200ms $intro-easing;

        .video-description-overlay-text {
          width: 100%;
          height: min-content;
          padding: 15px;
          box-sizing: border-box;
        }
      }
    }

    .video-live {
      text-decoration: none;
      color: $video-thmb-overlay-textcolor;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      padding: 5px 12px;
      background-color: $video-thmb-overlay-bgcolor;
      box-sizing: border-box;
      border-radius: 5px;
      font-family: $default-font;
      display: flex;
      flex-direction: row;
      align-items: center;

      .live-text {
        margin: 0 0 0 10px;
      }

      .live-icon {
        width: 36px;
        height: 36px;

        .material-design-icon__svg {
          width: 36px;
          height: 36px;
        }
      }
    }

    .video-saved-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background-color: var(--theme-color);
      max-width: 100%;
    }

    .video-entry-length {
      text-decoration: none;
      color: $video-thmb-overlay-textcolor;
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 2px 6px;
      margin: 8px 8px;
      background-color: $video-thmb-overlay-bgcolor;
      box-sizing: border-box;
      border-radius: 4px;
      font-family: $default-font;
      transition: transform 200ms $intro-easing;
    }
  }

  .video-entry-info {
    padding: 0 0 5px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    z-index: 11;

    .video-info-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      width: 100%;

      .video-entry-title {
        text-decoration: none;
        margin: 0;
        font-size: 0.9rem;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: var(--title-color);
        padding: 8px 0 4px 0;
        width: 100%;
        box-sizing: border-box;
      }

      .video-entry-stats {
        color: var(--subtitle-color-light);
        display: flex;
        width: 100%;
        justify-content: space-between;
        flex-direction: row;
        font-size: 0.8rem;
        margin: 0 0 0 0;
      }
    }
  }
}
</style>
