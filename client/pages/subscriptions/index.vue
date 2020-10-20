<template>
  <div class="subscriptions">
    <GradientBackground :color="'green'" />
    <div class="subscribe-info-container">
      <div class="subscribe-info">
        <div class="info">
          <h2>Subscription feed for {{ $store.getters['user/username'] }}</h2>
          <p>Last refresh: {{ lastRefreshTime }}</p>
          <p>Next refresh: {{ nextRefreshTime }}</p>
        </div>
        <div class="actions">
          <BadgeButton
            class="import-subscriptions-btn"
            :click="() => (subscriptionImportOpen = true)"
          >
            <ImportIcon />
            <p>Import subscriptions</p>
          </BadgeButton>
          <BadgeButton
            class="manage-subscriptions-btn"
            :href="'subscriptions/manage'"
            :internal-link="true"
          >
            <EditIcon />
            <p>Manage</p>
          </BadgeButton>
          <SwitchButton
            v-tippy="getNotificationStatus"
            :value="notificationsEnabled"
            :label="'Enable notifications'"
            :disabled="notificationsBtnDisabled"
            @valuechange="subscribeToNotifications"
          />
        </div>
      </div>
    </div>
    <div class="subscription-videos-container">
      <div
        v-for="(videoSection, index) in orderedVideoSections"
        :key="index"
        class="subscription-section"
      >
        <SectionTitle :title="videoSection.sectionMessage" />
        <div class="section-videos-container">
          <VideoEntry v-for="video in videoSection.videos" :key="video.videoId" :video="video" />
        </div>
      </div>
    </div>
    <div class="feed-pagination">
      <Pagination :currentPage="currentPage" :pageCount="pageCount" />
    </div>

    <portal to="popup">
      <transition name="fade-down">
        <SubscriptionImport
          v-if="subscriptionImportOpen"
          @close="closeSubscriptionImport"
          @done="onSubscriptionImportDone"
        />
      </transition>
    </portal>
  </div>
</template>

<script lang="ts">
import Commons from '@/plugins/commons.ts';
import SubscriptionImport from '@/components/popup/SubscriptionImport.vue';
import VideoEntry from '@/components/list/VideoEntry.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import SwitchButton from '@/components/buttons/SwitchButton.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import EditIcon from 'vue-material-design-icons/PencilBoxMultipleOutline.vue';
import ImportIcon from 'vue-material-design-icons/Import.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'Home',
  components: {
    VideoEntry,
    SubscriptionImport,
    GradientBackground,
    SectionTitle,
    SwitchButton,
    BadgeButton,
    EditIcon,
    ImportIcon,
    Pagination
  },
  async fetch() {
    if (process.browser) {
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const apiUrl = this.$store.getters['environment/apiUrl'];
    const limit = 20;
    if (this.$route.query && this.$route.query.page) {
      this.currentPage = parseInt(this.$route.query.page);
    }
    const start = (this.currentPage - 1) * 30;
    await this.$axios
      .get(`${apiUrl}user/subscriptions/videos?limit=${limit}&start=${start}`, {
        withCredentials: true
      })
      .then(response => {
        this.videos = response.data.videos;
        this.pageCount = Math.ceil(response.data.videoCount / 30);
        this.loading = false;
      })
      .catch(_ => {
        this.$store.dispatch('messages/createMessage', {
          type: 'error',
          title: 'Error loading subscription feed',
          message: 'Error loading subscription feed'
        });
      });
  },
  data: () => ({
    videos: [],
    loading: true,
    commons: Commons,
    notificationsEnabled: false,
    notificationsBtnDisabled: false,
    notificationsSupported: true,
    subscriptionImportOpen: false,
    vapidKey: null,
    currentPage: 1,
    currentPageTest: 1,
    pageCount: 1,
    pageCountTest: 1
  }),
  computed: {
    orderedVideoSections() {
      const orderedArray = [];
      let i = 0;
      this.videos.forEach(video => {
        let sectionMessage = 'Older videos';
        const now = new Date();
        if (video.published > now.valueOf() - 604800000) {
          sectionMessage = 'Last 7 days';
        }
        if (video.published > now.valueOf() - 172800000) {
          sectionMessage = 'Yesterday';
        }
        if (video.published > now.valueOf() - 86400000) {
          sectionMessage = 'Today';
        }
        const possibleIndex = orderedArray.findIndex(el => el.sectionMessage === sectionMessage);
        if (possibleIndex !== -1) {
          orderedArray[possibleIndex].videos.push(video);
        } else {
          orderedArray.push({ sectionMessage, videos: [video], id: i++ });
        }
      });
      return orderedArray;
    },
    lastRefreshTime() {
      const now = new Date();
      now.setMinutes(Math.floor(now.getMinutes() / 30) * 30);
      now.setSeconds(0);
      return now.toLocaleString();
    },
    nextRefreshTime() {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
      now.setSeconds(0);
      return now.toLocaleString();
    }
  },
  watch: {
    '$route.query': '$fetch'
  },
  mounted() {
    this.vapidKey = this.$store.getters['environment/vapidKey'];

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then(registrations => {
          const worker = registrations[0];
          worker.pushManager
            .permissionState({
              userVisibleOnly: true,
              applicationServerKey: this.vapidKey
            })
            .then(permissionState => {
              console.log(permissionState);
              if (permissionState === 'granted') {
                this.notificationsEnabled = true;
              } else if (permissionState === 'denied') {
                this.notificationsEnabled = false;
                this.notificationsBtnDisabled = true;
              }
            });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      this.notificationsSupported = false;
      this.notificationsBtnDisabled = true;
    }
  },
  methods: {
    closeSubscriptionImport() {
      this.subscriptionImportOpen = false;
    },
    onSubscriptionImportDone() {
      this.$fetch();
    },
    subscribeToNotifications(val) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          const worker = registrations[0];

          if (val) {
            worker.pushManager
              .subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.vapidKey
              })
              .then(subscription => {
                this.$axios
                  .post(
                    `${this.$store.getters['environment/apiUrl']}user/notifications/subscribe`,
                    subscription,
                    {
                      withCredentials: true
                    }
                  )
                  .then(() => {
                    this.notificationsEnabled = true;
                  });
              })
              .catch(err => {
                this.notificationsEnabled = false;
                this.notificationsBtnDisabled = true;
                console.log(err);
              });
          } else {
            worker.pushManager.getSubscription().then(subscription => {
              if (subscription) {
                subscription.unsubscribe();
              }
              this.notificationsEnabled = false;
            });
          }
        });
      }
    },
    getNotificationStatus() {
      if (this.notificationsBtnDisabled && this.notificationsEnabled) {
        return 'Notifications are enabled';
      } else if (this.notificationsSupported) {
        return 'Notifications are not supported';
      } else if (!this.notificationsBtnDisabled && !this.notificationsEnabled) {
        return 'Notifications are disabled';
      }
    }
  },
  head() {
    return {
      title: `Subscriptions :: ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'See your subscription feed'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Subscriptions - ViewTube'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'See your subscription feed'
        }
      ]
    };
  }
});
</script>

<style lang="scss">
.subscriptions {
  .section-title {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    padding: 0 10px;
    box-sizing: border-box;

    .manage-btn-container {
      width: auto;
      position: absolute;
      right: 0;
      z-index: 11;
      height: 80px;
      display: grid;
      padding: 0 15px 0 0;
      display: flex;
      flex-direction: row;

      .badge-btn {
        margin: auto auto auto 10px;
      }
    }
  }

  .subscribe-info-container {
    position: relative;
    width: 100%;
    max-width: $main-width;
    margin: 30px auto 0 auto;
    padding: 0 10px;
    z-index: 11;
    box-sizing: border-box;

    .subscribe-info {
      display: flex;
      flex-direction: row;
      padding: 15px;
      box-sizing: border-box;
      background: var(--bgcolor-alt);
      justify-content: space-between;
      border-radius: 5px;
      box-shadow: $medium-shadow;
      box-sizing: border-box;

      @media screen and (max-width: 1000px) {
        flex-direction: column;

        .actions {
          margin: 10px 0 0 0;
        }
      }

      .info {
        display: flex;
        flex-direction: column;
      }

      .actions {
        display: flex;
        flex-direction: row;
        align-items: flex-start;

        .switch {
          margin: 5px 0 0 0 !important;
        }
      }
    }
  }

  .subscription-videos-container {
    .subscription-section {
      .section-videos-container {
        width: 100%;
        max-width: $main-width;
        margin: 0 auto;
        padding: 0 10px;
        box-sizing: border-box;
        z-index: 10;
        @include viewtube-grid;

        @media screen and (max-width: $mobile-width) {
          flex-direction: column;
        }
      }
    }
  }

  .feed-pagination {
    display: block;
    position: relative;
    z-index: 11;
    margin: 0 0 30px 0;
  }
}
</style>
