<template>
  <div class="profile">
    <Spinner v-if="$fetchState.pending" class="centered" />
    <div v-if="profile" class="user-info">
      <div class="profile-img">
        <AccountCircleIcon />
      </div>
      <div class="user-name">
        <p>{{ profile.username }}</p>
      </div>
    </div>
    <div v-if="profile" class="actions">
      <BadgeButton :click="onLogoutPopup" style="color: #ef4056">Logout</BadgeButton>
    </div>
    <div v-if="profile" class="statistics">
      <p>
        <span class="highlight">{{ profile.totalVideosCount }} videos</span> watched
      </p>
      <p>
        <span class="highlight">{{ profile.totalTimeString }}</span> spent watching videos
      </p>
      <p>
        <span class="highlight">{{ profile.subscribedChannelsCount }} channels</span> subscribed to
      </p>
    </div>
    <div v-if="profile && profile.videoHistory.length <= 0" class="no-history">
      <p>You haven't watched any videos yet. Once you have, your history will show up here.</p>
    </div>
    <div v-if="profile && profile.videoHistory.length > 0" class="video-history">
      <div v-for="(video, index) in profile.videoHistory" :key="index" class="history-entry">
        <div class="thumbnail">
          <img
            :src="video.videoDetails.videoThumbnails[3].url"
            :alt="video.videoDetails.title"
            class="thumbnail-img"
          />
          <div class="progress-bar">
            <span
              class="progress-line"
              :style="{ width: `${(video.progressSeconds / video.lengthSeconds) * 100}%` }"
            />
          </div>
        </div>
        <div class="content">
          <div class="title">
            <nuxt-link :to="`/watch?v=${video.videoId}`">{{ video.videoDetails.title }}</nuxt-link>
          </div>
          <div class="author">
            <nuxt-link :to="`/channel/${video.videoDetails.authorId}`">
              {{ video.videoDetails.author }}</nuxt-link
            >
          </div>
          <div v-tippy="Date(video.lastVisit).toLocaleString()" class="watched-date tooltip">
            Last watched: {{ humanizeDateString(video.lastVisit) }} ago
          </div>
          <div class="watch-progress">
            Progress: {{ $formatting.getTimestampFromSeconds(video.progressSeconds) }} of
            {{ $formatting.getTimestampFromSeconds(video.lengthSeconds) }}
          </div>
        </div>
      </div>
    </div>
    <portal to="popup">
      <transition name="popup">
        <Confirmation
          v-if="logoutPopup"
          :title="'Logout'"
          :message="'Do you want to log out?'"
          @close="() => (logoutPopup = false)"
        >
          <BadgeButton :click="() => (logoutPopup = false)">Cancel</BadgeButton>
          <BadgeButton :click="logout">OK</BadgeButton>
        </Confirmation>
      </transition>
    </portal>
  </div>
</template>

<script lang="ts">
import Spinner from '@/components/Spinner.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import AccountCircleIcon from 'vue-material-design-icons/AccountCircle.vue';
import Confirmation from '@/components/popup/Confirmation.vue';
import humanizeDuration from 'humanize-duration';

import Vue from 'vue';
export default Vue.extend({
  name: 'Profile',
  components: {
    Spinner,
    BadgeButton,
    AccountCircleIcon,
    Confirmation
  },
  data() {
    return {
      profile: null,
      logoutPopup: false
    };
  },
  async fetch() {
    if (this.$store.getters['user/isLoggedIn']) {
      const apiUrl = this.$store.getters['environment/apiUrl'];
      await this.$axios
        .get(`${apiUrl}user/profile/details`)
        .then((result: { data: any }) => {
          if (result) {
            this.profile = result.data;
          }
        })
        .catch((_: any) => {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Error loading profile',
            message: 'Try logging out and in again'
          });
        });
    } else {
      this.$nuxt.context.redirect('/login');
    }
  },
  head() {
    return {
      title: `${this.profile ? this.profile.username + ' :: ' : ''}Profile :: ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'See your profile'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Your profile'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'See your profile'
        }
      ]
    };
  },
  methods: {
    onLogoutPopup() {
      this.logoutPopup = true;
    },
    onLogoutPopupClose() {
      this.logoutPopup = false;
    },
    logout() {
      this.$store.dispatch('user/logout');
      this.$router.push('/');
    },
    humanizeSeconds(seconds: number): string {
      return humanizeDuration(seconds * 1000);
    },
    humanizeDateString(dateString: string): string {
      const now = new Date();
      const date = new Date(dateString);
      const dateMs = now.valueOf() - date.valueOf();
      return humanizeDuration(dateMs, { largest: 1 });
    }
  }
});
</script>

<style lang="scss">
.popup-enter-active,
.popup-leave-active {
  transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;
}
.popup-enter-to,
.popup-leave {
  opacity: 1;
  transform: scale(1);
}
.popup-enter,
.popup-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.profile {
  width: 100%;
  max-width: 700px;
  padding-top: $header-height;
  margin: 0 auto;
  max-height: calc(100% - #{$header-height});
  box-sizing: border-box;
  overflow: hidden;

  .user-info {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 10px 0 0 0;

    .profile-img {
      .material-design-icon {
        width: 56px;
        height: 56px;
        .material-design-icon__svg {
          width: 56px;
          height: 56px;
        }
      }
    }
    .user-name {
      padding: 5px 0 0 10px;
      font-size: 1.8rem;
    }
  }

  .statistics {
    .highlight {
      color: var(--theme-color);
    }
  }

  .video-history {
    display: flex;
    flex-direction: column;

    .history-entry {
      display: flex;
      flex-direction: row;
      margin: 5px 0;

      .thumbnail {
        position: relative;
        flex-grow: 1;

        .thumbnail-img {
          max-width: 100%;
          min-height: 100%;
        }

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: var(--line-accent-color);

          .progress-line {
            height: 3px;
            background-image: $theme-color-primary-gradient;
            display: block;
          }
        }
      }

      .content {
        flex-grow: 3;
        margin: 0 0 0 10px;

        .title {
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--title-color);
          padding: 0 0 4px 0;
        }
        .author {
          font-size: 0.8rem;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--subtitle-color);
          padding: 3px 0 4px 0;
        }
        .watched-date {
          font-size: 0.8rem;
          color: var(--subtitle-color-light);
        }
        .watch-progress {
          font-size: 0.8rem;
          color: var(--subtitle-color-light);
        }
      }
    }
  }
}
</style>
