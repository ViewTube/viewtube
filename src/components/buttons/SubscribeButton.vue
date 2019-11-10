<template>
  <div class="subscribe-button-container" :class="{ disabled: disabled }">
    <div
      class="unsubscribe-button"
      :class="{ hidden: !isSubscribed }"
      @click="unsubscribe"
      tabindex="0"
      data-tippy-content="unsubscribe from this channel"
    ></div>
    <div
      class="subscribe-button"
      :class="{ hidden: isSubscribed }"
      @click="subscribe"
      tabindex="0"
      data-tippy-content="subscribe to this channel"
    ></div>
  </div>
</template>

<script>
import Commons from '@/commons.js'

export default {
  name: 'subscribe-button',
  props: {
    channelId: null
  },
  data: function () {
    return {
      isSubscribed: false,
      disabled: true
    }
  },
  mounted: function () {
    this.loadSubscriptionStatus()
  },
  methods: {
    loadSubscriptionStatus: function () {
      if (this.channelId && this.$cookie.get('jwt')) {
        let jwt = this.$cookie.get('jwt')
        let me = this
        fetch(`${Commons.getOwnApiUrl()}subscriptions/getSubscriptionChannels.php?channelId=${this.channelId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${jwt}`
          }
        })
          .then(response => response.json())
          .then(data => {
            if (data.isSubscribed) {
              me.isSubscribed = true
            } else {
              me.isSubscribed = false
            }
            me.disabled = false
          })
          .catch(error => {
            console.error(error)
            me.isSubscribed = false
            me.disabled = false
          })
      }
    },
    subscribe: function () {
      this.setSubscriptionStatus('PUT')
    },
    unsubscribe: function () {
      this.setSubscriptionStatus('DELETE')
    },
    setSubscriptionStatus: function (action) {
      if (this.channelId && this.$cookie.get('jwt')) {
        this.disabled = true
        let jwt = this.$cookie.get('jwt')
        let me = this
        fetch(`${Commons.getOwnApiUrl()}subscriptions/getSubscriptionChannels.php`, {
          method: action,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${jwt}`
          },
          body: JSON.stringify({
            channelId: this.channelId
          })
        })
          .then(response => response.json())
          .then(data => {
            me.loadSubscriptionStatus()
            me.disabled = false
          })
          .catch(error => {
            console.error(error)
            me.loadSubscriptionStatus()
            me.disabled = false
          })
      }
    }
  }
}
</script>

<style lang="scss">
.subscribe-button-container {
  width: 140px;
  height: 32px;
  position: relative;

  &.disabled {
    pointer-events: none;
  }

  .subscribe-button,
  .unsubscribe-button {
    width: 140px;
    height: 32px;
    border-radius: 5px;
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    cursor: pointer;
    line-height: 12px;
    opacity: 1;
    transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;

    &:focus {
      transform: scale(0.9);
    }

    &.hidden {
      opacity: 0;
      transform: scale(0);
      pointer-events: none;
    }

    &:before {
      content: "";
      z-index: 1;
      position: absolute;
      display: block;
      width: 80%;
      height: 70%;
      top: 15%;
      left: 10%;
      transition: 0.3s opacity ease-in-out;
      filter: blur(20px);
      opacity: 0;
      background: $theme-color-primary-gradient;
    }

    &:hover:before {
      opacity: 1;
      transition: 0.3s opacity ease-in-out;
      filter: blur(20px);
      background: $theme-color-primary-gradient;
    }

    &:after {
      text-align: center;
      line-height: 32px;
      font-size: 15px;
      color: rgba(235, 235, 235, 1);
      font-family: "Verdana";
      font-weight: bold;
      z-index: 5;
      position: absolute;
      display: block;
      border-radius: 5px;
      width: 100%;
      height: 100%;
      top: 0%;
      left: 0%;
      background: $theme-color-primary-gradient;
    }
  }

  .subscribe-button {
    &:after {
      content: "SUBSCRIBE";
    }
  }

  .unsubscribe-button {
    width: 140px;

    &:before {
      background: $bgcolor-gradient;
    }

    &:hover:before {
      opacity: 1;
      transition: 0.3s opacity ease-in-out;
      filter: blur(20px);
      background: $bgcolor-gradient;
    }

    &:after {
      content: "UNSUBSCRIBE";
      background: $bgcolor-alt-light;
    }
  }
}
</style>
