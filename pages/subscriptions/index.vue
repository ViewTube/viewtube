<template>
  <div class="subscriptions">
    <GradientBackground :color="'green'" />
    <SectionTitle :title="'Subscriptions'">
      <div class="manage-btn-container">
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
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import BottomNavigation from '@/components/BottomNavigation'
import GradientBackground from '@/components/GradientBackground'
import SectionTitle from '@/components/SectionTitle'
import SwitchButton from '@/components/buttons/SwitchButton'
import BadgeButton from '@/components/buttons/BadgeButton'
import EditIcon from 'vue-material-design-icons/PencilBoxMultipleOutline'

export default {
  name: 'Home',
  components: {
    VideoEntry,
    BottomNavigation,
    GradientBackground,
    SectionTitle,
    SwitchButton,
    BadgeButton,
    EditIcon,
  },
  data: () => ({
    videos: [],
    loading: true,
    commons: Commons,
    notificationsEnabled: false,
    notificationsBtnDisabled: false,
    notificationsSupported: true
  }),
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
          worker.pushManager.permissionState().then(permissionState => {
            console.log(permissionState)
            if (permissionState === 'granted') {
              this.notificationsEnabled = true
            } else if (permissionState === 'denied') {
              this.notificationsEnabled = false
              this.notificationsBtnDisabled = true
            }
          })
        })
    } else {
      this.notificationsSupported = false
      this.notificationsBtnDisabled = true
    }
  },
  methods: {
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
                  applicationServerKey: this.urlBase64ToUint8Array(
                    'BGVr0ZXSAkSL3JGl8IDylvLaD9B_cisWqESJ3_mrBOk0xZ1axMNbIYF5DF1IWi2Htuzj3Hu34WfNwBx210fkmHE'
                  ),
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
    },
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')

      const rawData = window.atob(base64)
      const outputArray = new Uint8Array(rawData.length)

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
      }
      return outputArray
    }
  }
}
</script>

<style lang="scss">
.subscriptions {
  .manage-btn-container {
    width: auto;
    position: absolute;
    right: 0;
    z-index: 11;
    height: 80px;
    display: grid;
    padding: 0 20px 0 0;

    .badge-btn {
      margin: auto;
    }
  }

  .subscribe-btn-container {
    width: auto;
    position: relative;
    left: 0;
    z-index: 11;
    height: 80px;
    display: flex;
    padding: 0 20px 0 20px;

    .badge-btn {
      margin: auto;
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
