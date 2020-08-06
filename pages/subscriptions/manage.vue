<template>
  <div class="manage-subscriptions">
    <GradientBackground :color="'green'" />
    <SectionTitle :title="'Manage subscriptions'">
      <div class="subscribe-btn-container">
        <BadgeButton
          class="manage-subscriptions-btn"
          :click="subscribeToNotifications"
        >
          <!-- <EditIcon /> -->
          <p>Enable push notifications</p>
        </BadgeButton>
      </div>
    </SectionTitle>
    <div class="channels-container">
      <div
        class="channel-entry"
        v-for="channel in subscriptionChannels"
        :key="channel.authorId"
      >
        <nuxt-link
          :to="`/channel/${channel.authorId}`"
          v-if="!channel.authorThumbnails || channel.authorThumbnails.length == 0"
          class="fake-thmb"
        >
          <h3>{{ channelNameToImgString(channel.author) }}</h3>
        </nuxt-link>
        <nuxt-link
          :to="`/channel/${channel.authorId}`"
          class="channel-image-container"
          v-if="channel.authorThumbnailUrl || (channel.authorThumbnails && channel.authorThumbnails.length > 0)"
        >
          <img
            :src="channel.authorThumbnailUrl ? `${commons.getOwnApiUrl()}${channel.authorThumbnailUrl}` : channel.authorThumbnails[2].url"
            class="channel-image"
            alt="Channel profile image"
          />
        </nuxt-link>
        <div class="channel-title">
          <nuxt-link :to="`/channel/${channel.authorId}`">{{channel.author}}</nuxt-link>
        </div>
        <div class="channel-subscribe-btn">
          <SubscribeButton
            :isInitiallySubscribed="true"
            :channelId="channel.authorId"
            :small="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GradientBackground from '@/components/GradientBackground'
import SectionTitle from '@/components/SectionTitle'
import Commons from '@/plugins/commons'
import SubscribeButton from '@/components/buttons/SubscribeButton'
import BadgeButton from '@/components/buttons/BadgeButton'

export default {
  name: 'ManageSubscriptions',
  components: {
    GradientBackground,
    SectionTitle,
    SubscribeButton,
    BadgeButton
  },
  data() {
    return {
      commons: Commons,
      subscriptionChannels: []
    }
  },
  mounted() {
    return this.$axios.get(`${Commons.getOwnApiUrl()}user/subscriptions/channels`, {
      withCredentials: true
    })
      .then((response) => {
        this.subscriptionChannels = response.data
        this.loading = false
      })
      .catch((error) => {
        console.error(error)
      })
  },
  methods: {
    channelNameToImgString(name) {
      let initials = ''
      name.split(' ').forEach((e) => {
        initials += e.charAt(0)
      })
      return initials
    },
    subscribeToNotifications() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(async (registrations) => {
          console.log(registrations)
          const worker = registrations[0]
          worker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array('BGVr0ZXSAkSL3JGl8IDylvLaD9B_cisWqESJ3_mrBOk0xZ1axMNbIYF5DF1IWi2Htuzj3Hu34WfNwBx210fkmHE')
          })
            .then(subscription => {
              this.$axios.post(`${Commons.getOwnApiUrl()}user/notifications/subscribe`, subscription, {
                withCredentials: true
              })
            })
            .catch(err => {
              console.log(err)
            })
        })
      }
    },
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  }
}
</script>

<style lang="scss">
.manage-subscriptions {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  width: 100%;

  .subscribe-btn-container {
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

  .channels-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 11;
    display: flex;
    flex-direction: column;
    position: relative;

    .channel-entry {
      display: flex;
      flex-direction: row;
      width: calc(100% - 20px);
      justify-content: space-between;
      padding: 0 10px;
      margin: 0 10px;
      box-sizing: border-box;
      height: 50px;
      text-align: start;
      position: relative;
      align-items: center;

      .channel-image-container {
        width: 36px;
        height: 36px;
        box-shadow: $low-shadow;

        .channel-image {
          width: 100%;
        }
      }

      .fake-thmb {
        overflow: hidden;
        background-color: var(--theme-color);
        height: 36px;
        width: 36px;
        display: flex;
        box-shadow: $low-shadow;

        h3 {
          font-size: 1.8rem;
          white-space: normal;
          text-align: center;
          margin: auto;
        }
      }

      .channel-title {
        flex: 1;
        line-height: 36px;
        margin: 0 0 0 10px;
        font-size: 1.2rem;
      }

      .channel-subscribe-btn {
        width: 140px;
      }
    }
  }
}
</style>