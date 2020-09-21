<template>
  <div class="subscriptions">
    <GradientBackground :color="'green'" />
    <SectionTitle :title="'Subscriptions'">
      <div class="manage-btn-container">
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
      </div>
    </SectionTitle>
    <div class="subscribe-btn-container">
      <SwitchButton
        v-tippy="getNotificationStatus"
        :value="notificationsEnabled"
        :label="'Enable notifications'"
        :disabled="notificationsBtnDisabled"
        @valuechange="subscribeToNotifications"
      />
    </div>
    <div class="subscription-videos-container">
      <VideoEntry v-for="video in videos" :key="video.videoId" :video="video" />
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

<script>
import Commons from '@/plugins/commons.js';
import SubscriptionImport from '@/components/popup/SubscriptionImport';
import VideoEntry from '@/components/list/VideoEntry';
import GradientBackground from '@/components/GradientBackground';
import SectionTitle from '@/components/SectionTitle';
import SwitchButton from '@/components/buttons/SwitchButton';
import BadgeButton from '@/components/buttons/BadgeButton';
import EditIcon from 'vue-material-design-icons/PencilBoxMultipleOutline';
import ImportIcon from 'vue-material-design-icons/Import';

export default {
  name: 'Home',
  components: {
    VideoEntry,
    SubscriptionImport,
    GradientBackground,
    SectionTitle,
    SwitchButton,
    BadgeButton,
    EditIcon,
    ImportIcon
  },
  async fetch() {
    await this.$axios
      .get(`${this.$store.getters['environment/apiUrl']}user/subscriptions/videos`, {
        withCredentials: true
      })
      .then(response => {
        this.videos = response.data;
        this.loading = false;
      })
      .catch(error => {
        console.log(error);
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
    vapidKey: null
  }),
  mounted() {
    this.vapidKey = this.$config.vapidKey;

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
                  .then(result => {
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
};
</script>

<style lang="scss">
.subscriptions {
  .section-title {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;

    .title {
      margin: 0 0 0 15px;
    }

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

  .subscribe-btn-container {
    position: relative;
    left: 0;
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 11;
    height: 40px;
    display: flex;
    padding: 0 15px 0 15px;
    box-sizing: border-box;

    .switch {
      margin: 0 !important;
    }
  }

  .subscription-videos-container {
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
</style>
