<template>
  <div class="subscriptions">
    <GradientBackground :color="'green'" />
    <SectionTitle :title="'Subscriptions'">
      <div class="manage-btn-container">
        <BadgeButton class="import-subscriptions-btn" :click="() => subscriptionImportOpen = true">
          <ImportIcon />
          <p>Import subscriptions</p>
        </BadgeButton>
        <BadgeButton
          class="manage-subscriptions-btn"
          :href="'subscriptions/manage'"
          :internalLink="true"
        >
          <EditIcon />
          <p>Manage</p>
        </BadgeButton>
      </div>
    </SectionTitle>
    <div class="subscribe-btn-container">
      <SwitchButton
        :value="notificationsEnabled"
        :label="'Enable notifications'"
        :disabled="notificationsBtnDisabled"
        @valuechange="subscribeToNotifications"
        v-tippy="getNotificationStatus"
      />
    </div>
    <div class="subscription-videos-container">
      <VideoEntry v-for="video in videos" :key="video.videoId" :video="video" />
    </div>
    <portal to="popup">
      <transition name="fade-down">
        <SubscriptionImport v-if="subscriptionImportOpen" @close="closeSubscriptionImport" />
      </transition>
    </portal>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js'
import SubscriptionImport from '@/components/popup/SubscriptionImport'
import VideoEntry from '@/components/list/VideoEntry'
import GradientBackground from '@/components/GradientBackground'
import SectionTitle from '@/components/SectionTitle'
import SwitchButton from '@/components/buttons/SwitchButton'
import BadgeButton from '@/components/buttons/BadgeButton'
import EditIcon from 'vue-material-design-icons/PencilBoxMultipleOutline'
import ImportIcon from 'vue-material-design-icons/Import'

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
  created() {
    if (this.vapidKey) {
      this.vapidKey = Commons.getVAPIDKey()
    }
  },
  mounted() {
    this.$axios
      .get(`${Commons.getOwnApiUrl()}user/subscriptions/videos`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response.data)
        this.videos = response.data
        this.loading = false
      })
      .catch((error) => {
        console.error(error)
      })

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then(async (registrations) => {
          const worker = registrations[0]
          worker.pushManager.permissionState({
            userVisibleOnly: true,
            applicationServerKey: this.vapidKey
          }).then(permissionState => {
            console.log(permissionState)
            if (permissionState === 'granted') {
              this.notificationsEnabled = true
            } else if (permissionState === 'denied') {
              this.notificationsEnabled = false
              this.notificationsBtnDisabled = true
            }
          })
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      this.notificationsSupported = false
      this.notificationsBtnDisabled = true
    }
  },
  methods: {
    closeSubscriptionImport() {
      this.subscriptionImportOpen = false
    },
    subscribeToNotifications(val) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then(async (registrations) => {
            const worker = registrations[0]

            if (val) {
              worker.pushManager
                .subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: this.vapidKey
                })
                .then((subscription) => {
                  this.$axios.post(
                    `${Commons.getOwnApiUrl()}user/notifications/subscribe`,
                    subscription,
                    {
                      withCredentials: true,
                    }
                  ).then(result => {
                    this.notificationsEnabled = true
                  })
                })
                .catch((err) => {
                  this.notificationsEnabled = false
                  this.notificationsBtnDisabled = true
                  console.log(err)
                })
            } else {
              worker.pushManager.getSubscription().then(subscription => {
                if (subscription) {
                  subscription.unsubscribe()
                }
                this.notificationsEnabled = false
              })
            }
          })
      }
    },
    getNotificationStatus() {
      if (notificationsBtnDisabled && notificationsEnabled) {
        return 'Notifications are enabled'
      } else if (notificationsSupported) {
        return 'Notifications are not supported'
      } else if (!notificationsBtnDisabled && !notificationsEnabled) {
        return 'Notifications are disabled'
      }
    }
  }
}
</script>

<style lang="scss">
.subscriptions {
  .section-title {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;

    .manage-btn-container {
      width: auto;
      position: absolute;
      right: 0;
      z-index: 11;
      height: 80px;
      display: grid;
      padding: 0 20px 0 0;
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
    padding: 0 20px 0 20px;
    box-sizing: border-box;

    .switch {
      margin: 0 !important;
    }
  }

  .subscription-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }
  }
}
</style>
