<template>
  <div class="profile">
    <Spinner v-if="$fetchState.pending" class="centered" />
    <div v-if="profile" class="profile-top">
      <div class="gradient-background" />
      <div class="profile-top-card">
        <div v-if="profile" class="user-info">
          <div class="profile-img">
            <AccountCircleIcon />
          </div>
          <div class="user-name">
            <p>{{ profile.username }}</p>
          </div>
        </div>
        <div v-if="profile" class="statistics" :class="{ blurred: actionsOpen }">
          <p>
            <span class="highlight">{{ profile.totalVideosCount }} videos</span> watched
          </p>
          <p>
            <span class="highlight">{{ profile.totalTimeString }}</span> spent watching videos
          </p>
          <p>
            <span class="highlight">{{ profile.subscribedChannelsCount }} channels</span> subscribed
            to
          </p>
        </div>
        <div v-if="profile" class="actions">
          <input id="actions" v-model="actionsOpen" type="checkbox" name="actions" />
          <label for="actions" class="actions-icon">
            <SettingsIcon />
            <ChevronUpIcon class="chevron-icon" />
          </label>
          <div class="actions-details">
            <BadgeButton class="action" :href="'/api/user/export'"
              ><ExportIcon />Export data</BadgeButton
            >
            <BadgeButton class="action" :click="onLogoutPopup" style="color: #ef4056"
              ><LogoutIcon />Sign out</BadgeButton
            >
            <BadgeButton class="action" :click="onDeleteAccount" style="color: #ef4056"
              ><DeleteIcon />Delete account</BadgeButton
            >
          </div>
        </div>
      </div>
    </div>
    <div v-if="profile && !$accessor.settings.saveVideoHistory" class="no-history">
      <RestartOffIcon />
      <p>Video history is disabled. You can enable it in settings.</p>
    </div>
    <div v-if="profile && !hasHistory && $accessor.settings.saveVideoHistory" class="no-history">
      <HistoryIcon />
      <p>You haven't watched any videos yet. Once you have, your history will show up here.</p>
    </div>
    <div v-if="profile && hasHistory" class="video-history">
      <SectionTitle :title="'History'" />
      <div v-for="(video, index) in profile.videoHistory" :key="index" class="history-entry">
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
    <portal to="popup">
      <transition name="popup">
        <Confirmation
          v-if="logoutPopup"
          :title="'Sign out'"
          :message="'Do you want to sign out?'"
          @close="onLogoutPopupClose"
        >
          <BadgeButton :click="onLogoutPopupClose">Cancel</BadgeButton>
          <BadgeButton :click="logout">OK</BadgeButton>
        </Confirmation>
        <Confirmation
          v-if="deleteAccountPopup"
          :title="'Delete account'"
          :message="'Do you want to delete your account? This will immediately erase all related data. This action is irreversible.'"
          @close="onDeleteAccountClose"
        >
          <div class="repeat-username-container">
            <FormInput
              :id="'repeated-username'"
              v-model="repeatedUsername"
              :label="'Repeat your username'"
            />
            <BadgeButton
              :click="deleteAccount"
              :disabled="profile && !deleteAccountValid"
              class="delete-account-btn"
              >Delete account</BadgeButton
            >
          </div>
        </Confirmation>
      </transition>
    </portal>
  </div>
</template>

<script lang="ts">
import Spinner from '@/components/Spinner.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import FormInput from '@/components/form/FormInput.vue';
import AccountCircleIcon from 'vue-material-design-icons/AccountCircle.vue';
import ChevronUpIcon from 'vue-material-design-icons/ChevronUp.vue';
import LogoutIcon from 'vue-material-design-icons/LogoutVariant.vue';
import ExportIcon from 'vue-material-design-icons/DatabaseExportOutline.vue';
import DeleteIcon from 'vue-material-design-icons/DeleteAlert.vue';
import SettingsIcon from 'vue-material-design-icons/Cog.vue';
import HistoryIcon from 'vue-material-design-icons/History.vue';
import RestartOffIcon from 'vue-material-design-icons/RestartOff.vue';
import Confirmation from '@/components/popup/Confirmation.vue';
import humanizeDuration from 'humanize-duration';
import SectionTitle from '@/components/SectionTitle.vue';
import {
  computed,
  defineComponent,
  ref,
  useFetch,
  useMeta,
  useRouter
} from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';
import { useAxios } from '~/plugins/axios';

export default defineComponent({
  name: 'Profile',
  components: {
    Spinner,
    BadgeButton,
    AccountCircleIcon,
    RestartOffIcon,
    Confirmation,
    SectionTitle,
    LogoutIcon,
    ExportIcon,
    DeleteIcon,
    ChevronUpIcon,
    SettingsIcon,
    HistoryIcon,
    FormInput
  },
  setup(_) {
    const accessor = useAccessor();
    const axios = useAxios();
    const router = useRouter();

    const profile = ref(null);
    const logoutPopup = ref(false);
    const deleteAccountPopup = ref(false);
    const actionsOpen = ref(false);
    const repeatedUsername = ref('');
    const originalUsername = ref('');

    originalUsername.value = accessor.user.username;

    const hasHistory = computed(() => {
      if (profile.value && profile.value.videoHistory.length > 0) {
        return true;
      }
      return false;
    });
    const onLogoutPopup = () => {
      logoutPopup.value = true;
    };
    const onLogoutPopupClose = () => {
      logoutPopup.value = false;
    };
    const onDeleteAccount = () => {
      deleteAccountPopup.value = true;
    };
    const onDeleteAccountClose = () => {
      deleteAccountPopup.value = false;
    };
    const deleteAccount = () => {
      axios
        .delete(`${accessor.environment.apiUrl}user`, {
          data: { username: repeatedUsername.value }
        })
        .then(_ => {
          logout();
          accessor.messages.createMessage({
            type: 'info',
            title: 'Deleted account',
            message: `Successfully deleted account ${repeatedUsername.value}`
          });
        });
    };
    const deleteAccountValid = computed(() => {
      return repeatedUsername.value.length > 0 && repeatedUsername.value === originalUsername.value;
    });
    const logout = () => {
      accessor.user.logout();
      router.push('/');
    };
    const humanizeSeconds = (seconds: number): string => {
      return humanizeDuration(seconds * 1000);
    };
    const humanizeDateString = (dateString: string): string => {
      const now = new Date();
      const date = new Date(dateString);
      const dateMs = now.valueOf() - date.valueOf();
      return humanizeDuration(dateMs, { largest: 1 });
    };

    useFetch(async () => {
      if (accessor.user.isLoggedIn) {
        const apiUrl = accessor.environment.apiUrl;
        await axios
          .get(`${apiUrl}user/profile/details`)
          .then((result: { data: any }) => {
            if (result) {
              profile.value = result.data;
            }
          })
          .catch((_: any) => {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Error loading profile',
              message: 'Try logging out and in again'
            });
          });
      } else {
        router.push('/login');
      }
    });

    useMeta(() => ({
      title: `${
        profile && profile.value ? profile.value.username + ' :: ' : ''
      }Profile :: ViewTube`,
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
    }));

    return {
      profile,
      logoutPopup,
      deleteAccountPopup,
      repeatedUsername,
      actionsOpen,
      onLogoutPopup,
      onLogoutPopupClose,
      onDeleteAccount,
      onDeleteAccountClose,
      deleteAccount,
      deleteAccountValid,
      hasHistory,
      logout,
      humanizeDateString,
      humanizeDuration,
      humanizeSeconds
    };
  },
  head: {}
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

.repeat-username-container {
  display: flex;
  flex-direction: column;
  width: 100%;

  .form-input {
    #repeated-username {
      width: 100%;
      margin: 15px 0;
    }
    .input-label {
      left: 14px;
    }
  }

  .delete-account-btn {
    color: var(--error-color-red);
    border-color: var(--error-color-red);
    transition: color 300ms $intro-easing, background-color 300ms $intro-easing;

    &:hover {
      color: unset;
      border-color: var(--error-color-red);
      background-color: var(--error-color-red);
    }
  }
}

.profile {
  width: 100%;
  max-width: 700px;
  padding-top: $header-height;
  margin: 0 auto;
  max-height: calc(100% - #{$header-height});
  box-sizing: border-box;

  .profile-top {
    position: relative;
    box-sizing: border-box;
    margin: 0 10px;

    .gradient-background {
      position: absolute;
      width: 100%;
      height: 80%;
      left: 0;
      top: 20%;
      background: var(--theme-color-gradient);
      z-index: 7;
      filter: blur(50px);
      opacity: 0.7;

      @media screen and (max-width: $mobile-width) {
        top: 0;
      }
    }

    .profile-top-card {
      margin: 30px 0 0 40px;
      border-radius: 15px;
      padding: 15px 15px 15px 140px;
      height: 190px;
      z-index: 8;
      position: relative;
      box-sizing: border-box;
      width: calc(100% - 40px);
      box-shadow: $low-shadow;
      position: relative;

      @media screen and (max-width: $mobile-width) {
        margin: 130px 0 0 0;
        padding: 90px 15px 15px 20px;
        height: 230px;
        width: 100%;
      }

      &::before {
        content: '';
        background-color: var(--bgcolor-alt);
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        border-radius: 15px;
      }

      .user-info {
        display: flex;
        flex-direction: row;

        .profile-img {
          position: absolute;
          left: -40px;
          top: 20px;
          height: 150px;
          width: 150px;
          border-radius: 15px;
          background: linear-gradient(to bottom, var(--theme-color), var(--theme-color-dark));
          box-shadow: 4px 5px 12px var(--theme-color-translucent);

          @media screen and (max-width: $mobile-width) {
            left: 50%;
            top: -30%;
            transform: translateX(-50%);
          }

          .material-design-icon {
            padding: 20px;
            width: calc(100% - 40px);
            height: calc(100% - 40px);
            filter: var(--darkness);

            .material-design-icon__svg {
              fill: var(--bgcolor-main);
              width: 100%;
              height: 100%;
            }
          }
        }
        .user-name {
          font-size: 1.8rem;

          @media screen and (max-width: $mobile-width) {
            width: 100%;
            text-align: center;
          }
        }
      }

      .statistics {
        color: var(--subtitle-color);
        font-size: 0.9rem;
        margin: 0 0 5px 0;
        transition: filter 300ms 100ms $intro-easing;

        &.blurred {
          filter: blur(5px);
        }

        p {
          margin: 4px 0;

          .highlight {
            color: var(--title-color);
            font-weight: bold;
          }
        }
      }

      .actions {
        position: absolute;
        top: 20px;
        right: 18px;

        #actions {
          visibility: hidden;

          &:checked {
            ~ .actions-details {
              .action {
                transform: translateX(0);
                opacity: 1;
                user-select: unset;
                pointer-events: unset;
              }
            }

            ~ .actions-icon {
              .chevron-icon {
                transform: rotateX(180deg);
              }
            }
          }
        }
        .actions-icon {
          border: 2px solid var(--theme-color-translucent);
          position: absolute;
          right: 5px;
          top: 0;
          height: 24px;
          padding: 2px;
          border-radius: 3px;
          cursor: pointer;
          transition: border $intro-easing;

          &:hover {
            border: 2px solid var(--theme-color);
          }

          .chevron-icon {
            transition: transform 300ms $intro-easing;
          }
        }
        .actions-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          top: 10px;

          .action {
            transform: translateX(20px);
            opacity: 0;
            user-select: none;
            pointer-events: none;
            transition: transform 300ms $intro-easing, opacity 300ms $intro-easing;
          }

          @for $i from 0 through 2 {
            .action:nth-of-type(#{$i + 1}) {
              transition-delay: 100ms * $i !important;
            }
          }
        }

        @media screen and (max-width: $mobile-width) {
          top: unset;
          bottom: 20px;
        }
      }
    }
  }

  .no-history {
    margin: 60px 0 0 0;
    position: relative;
    width: 100%;
    text-align: center;
  }

  .video-history {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    margin: 0 10px;

    .history-entry {
      display: flex;
      flex-direction: row;
      margin: 5px 0;

      .history-entry-thumbnail {
        position: relative;
        padding-right: 200px;
        padding-bottom: 112.5px;
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

  .video-history {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    margin: 0 10px;

    .history-entry {
      display: flex;
      flex-direction: row;
      margin: 5px 0;

      .history-entry-thumbnail {
        position: relative;
        padding-right: 200px;
        padding-bottom: 112.5px;
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
}
</style>
