<template>
  <div
    class="subscribe-button-container"
    :class="{ disabled: disabled }"
  >
    <div
      class="mini-btn"
      v-if="small"
      :class="{ expanded }"
      @click="expanded = !expanded"
    >
      <span class="minus" />
    </div>
    <div
      class="clip-container"
      :class="{ expanded, small }"
    >
      <div
        v-tippy="'Unsubscribe from this channel'"
        class="unsubscribe-button"
        :class="{ hidden: !isSubscribed }"
        tabindex="0"
        @click="unsubscribe"
      />
      <div
        v-tippy="'Subscribe to this channel'"
        class="subscribe-button"
        :class="{ hidden: isSubscribed }"
        tabindex="0"
        @click="subscribe"
      />
    </div>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js';

export default {
  name: 'SubscribeButton',
  props: {
    channelId: null,
    isInitiallySubscribed: Boolean,
    small: Boolean
  },
  data: () => ({
    isSubscribed: false,
    disabled: true,
    expanded: true
  }),
  mounted() {
    if (this.isInitiallySubscribed) {
      this.isSubscribed = true;
      this.disabled = false;
    } else {
      this.loadSubscriptionStatus();
    }

    if (this.small) {
      this.expanded = false;
    }
  },
  methods: {
    loadSubscriptionStatus() {
      if (this.channelId) {
        const me = this;
        this.$axios
          .get(
            `${Commons.getOwnApiUrl()}user/subscriptions/${
              this.channelId
            }`,
            {
              withCredentials: true
            }
          )
          .then(response => {
            if (response.data.isSubscribed) {
              me.isSubscribed = true;
            } else {
              me.isSubscribed = false;
            }
            me.disabled = false;
          })
          .catch(error => {
            console.log(error);
            me.isSubscribed = false;
            me.disabled = true;
          });
      }
    },
    subscribe() {
      if (this.channelId) {
        this.disabled = true;
        this.$axios
          .put(
            `${Commons.getOwnApiUrl()}user/subscriptions/${
              this.channelId
            }`,
            {},
            {
              withCredentials: true
            }
          )
          .then(response => {
            if (response.data.isSubscribed) {
              this.isSubscribed = true;
            }
            this.disabled = false;
            if (this.small) {
              this.expanded = false;
            }
          })
          .catch(error => {
            console.error(error);
            this.disabled = false;
          });
      }
    },
    unsubscribe() {
      if (this.channelId) {
        this.disabled = true;
        this.$axios
          .delete(
            `${Commons.getOwnApiUrl()}user/subscriptions/${
              this.channelId
            }`,
            {
              withCredentials: true
            }
          )
          .then(response => {
            if (!response.data.isSubscribed) {
              this.isSubscribed = false;
            }
            this.disabled = false;
            if (this.small) {
              this.expanded = false;
            }
          })
          .catch(error => {
            console.error(error);
            this.disabled = false;
          });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.subscribe-button-container {
  width: 140px;
  height: 32px;
  position: relative;

  &.disabled {
    pointer-events: none;
  }

  .mini-btn {
    position: absolute;
    top: 0;
    right: 0;
    background-color: var(--bgcolor-alt-light);
    width: 32px;
    height: 32px;
    border-radius: 25px;
    cursor: pointer;
    user-select: none;
    opacity: 0.8;
    transition: transform 300ms $overshoot-easing,
      background-color 300ms $intro-easing;
    border: solid 2px transparent;
    box-sizing: border-box;

    .minus {
      background-color: #fff;
      width: 12px;
      height: 3px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &.expanded {
      transform: rotate(-90deg);
      border-color: var(--theme-color);
    }
  }

  .clip-container {
    clip-path: circle(15px at calc(100% - 10px) 50%);
    transform: translateX(40px);
    width: 140px;
    height: 32px;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    pointer-events: none;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    transition-property: clip-path, opacity, transform;

    &.expanded {
      transform: translateX(0);
      clip-path: circle(100px);
      opacity: 1;
      pointer-events: unset;
    }

    &.small {
      left: -46px;
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
      transition: opacity 300ms $intro-easing,
        transform 300ms $intro-easing;

      &:focus {
        transform: scale(0.9);
      }

      &.hidden {
        opacity: 0;
        transform: scale(0);
        pointer-events: none;
      }

      &:before {
        content: '';
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
        font-size: 16px;
        color: rgba(235, 235, 235, 1);
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
        content: 'SUBSCRIBE';
        font-family: $default-font;
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
        content: 'UNSUBSCRIBE';
        font-family: $default-font;
        background: var(--bgcolor-alt-light);
      }
    }
  }
}
</style>
