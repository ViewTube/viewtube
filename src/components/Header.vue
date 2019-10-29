<template>
  <div class="header">
    <router-link class="logo-link" to="/">
      <h1 class="logo">
        <span>View</span>
        <span class="logo-colored">Tube</span>
      </h1>
      <img
        class="logo-small"
        :class="{ inverted: currentRouteName!=='home' }"
        src="@/assets/icon-background-512.jpg"
        alt="ViewTube"
      />
    </router-link>
    <MainSearchBox />
    <div class="nav">
      <router-link
        to="/login"
        id="login"
        class="ripple tooltip nav-btn main"
        data-tippy-content="login"
        v-if="!userAuthenticated"
        v-html="'Login'"
      >Login</router-link>
      <router-link
        to="/register"
        id="register"
        class="ripple tooltip nav-btn"
        data-tippy-content="register"
        v-if="!userAuthenticated"
      >Register</router-link>
      <router-link
        to="/subscriptions"
        id="subscriptions"
        class="tooltip nav-btn main"
        data-tippy-content="view your subscriptions"
        v-show="userAuthenticated"
      >Subscriptions</router-link>
      <a
        href="#"
        @click.self.prevent="accountMenuVisible = !accountMenuVisible"
        id="account"
        class="ripple tooltip"
        data-tippy-content="account"
      >
        <AccountIcon />
      </a>
      <transition name="circle">
        <div class="menu" v-if="accountMenuVisible" v-on-clickaway="hideAccountMenu">
          <a
            href="#"
            v-if="!userAuthenticated"
            @click.self.prevent="login"
            id="login-btn"
            class="ripple tooltip menu-btn account-btn"
            data-tippy-content="login"
          >
            <AccountIcon />Login
          </a>
          <a
            href="#"
            v-if="!userAuthenticated"
            @click.self.prevent="register"
            id="login-btn"
            class="ripple tooltip menu-btn account-btn"
            data-tippy-content="register"
          >
            <AccountPlusIcon />Register
          </a>
          <a
            href="#"
            v-if="this.$route.name !== 'subscriptions' && userAuthenticated"
            @click.self.prevent="openSubscriptions"
            id="subscriptions-btn"
            class="ripple tooltip menu-btn"
            data-tippy-content="view your subscriptions"
          >
            <AccountPlusIcon />Subscriptions
          </a>
          <div class="account-menu" v-if="userAuthenticated">
            <AccountIcon />
            <div class="account-info">
              <p class="account-name">{{ loginState.username }}</p>
              <a class="logout-btn" href="#" @click.prevent="logout">Log out</a>
            </div>
          </div>
          <a
            href="#"
            @click.self.prevent="openInYT"
            id="open-in-yt"
            class="ripple tooltip menu-btn"
            data-tippy-content="view on youtube (hold alt for invidio.us)"
          >
            <YoutubeIcon />open in youtube
          </a>
          <a
            href="#"
            @click.self.prevent="share"
            id="share"
            class="ripple tooltip menu-btn"
            data-tippy-content="share"
          >
            <ShareIcon />share
          </a>
          <a
            href="#"
            @click.self.prevent="openSettings"
            id="settings-btn"
            class="ripple tooltip menu-btn"
            data-tippy-content="open settings"
          >
            <SettingsIcon />settings
          </a>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import ShareIcon from 'icons/Share.vue'
import SettingsIcon from 'icons/Settings.vue'
import MainSearchBox from '@/components/MainSearchBox'
import AccountIcon from 'icons/AccountCircle'
import AccountPlusIcon from 'vue-material-design-icons/AccountPlus'
import YoutubeIcon from 'icons/Youtube'
import tippy from 'tippy.js'
import { mixin as clickaway } from 'vue-clickaway'
import UserStore from '@/store/user.js'

export default {
  name: 'Header',
  components: {
    ShareIcon,
    SettingsIcon,
    AccountIcon,
    YoutubeIcon,
    AccountPlusIcon,
    MainSearchBox
  },
  mixins: [
    clickaway
  ],
  props: {
    scrolledTop: Boolean
  },
  data: function () {
    return {
      accountMenuVisible: false,
      loginState: UserStore.state
    }
  },
  methods: {
    disableDrag: function () {
      let elements = document.getElementsByClassName('ripple')
      Array.from(elements).forEach(element => {
        element.ondragstart = e => e.preventDefault()
        element.oncontextmenu = e => e.preventDefault()
      })
    },
    hideAccountMenu: function () {
      if (this.accountMenuVisible) {
        this.accountMenuVisible = false
      }
    },
    openInYT: function () {
    },
    share: function () {
      if (typeof navigator.share === 'function') {
        navigator.share({
          title: document.title,
          text: 'Hello World',
          url: window.location.href
        }).then(() => console.log('Successful share'))
          .catch(error => console.log('Error sharing:', error))
      }
      this.hideAccountMenu()
    },
    openSettings: function () {
      this.$router.push('/settings')
      this.hideAccountMenu()
    },
    openSubscriptions: function () {
      this.$router.push('/subscriptions')
      this.hideAccountMenu()
    },
    login: function () {
      this.$router.push('/login')
      this.hideAccountMenu()
    },
    register: function () {
      this.$router.push('/register')
      this.hideAccountMenu()
    },
    logout: function () {
      UserStore.logout()
      this.hideAccountMenu()
    }
  },
  mounted () {
    this.disableDrag()

    tippy('.tooltip', {
      duration: 300,
      arrow: false,
      delay: [500, 100],
      touch: 'hold',
      placement: 'bottom'
    })
  },
  computed: {
    currentRouteName () {
      return this.$route.name
    },
    userAuthenticated () {
      return Boolean(this.loginState.username)
    }
  }
}

</script>

<style lang="scss">
.circle-enter-active,
.circle-leave-active {
  transition: clip-path 300ms $intro-easing, transform 300ms $intro-easing;
}
.circle-enter-to,
.circle-leave {
  clip-path: circle(200% at 95% 0%);
  transform: translateY(0);
}
.circle-enter,
.circle-leave-to {
  clip-path: circle(0 at 95% 0%);
  transform: translateY(-20px);
}

.header {
  height: $header-height;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 800;
  background-color: $header-bgcolor;
  transition: box-shadow 600ms $intro-easing;
  box-shadow: $medium-shadow;

  .logo-link {
    text-decoration: none;
    margin: auto 10px auto 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;

    .logo {
      font-family: $header-font;
      font-size: 1.5rem;
      color: $subtitle-color;
      width: auto;
      overflow: hidden;
      transition: width 300ms linear;

      .logo-colored {
        color: transparent;
        background-image: $theme-color-gradient;
        background-clip: text;
        -webkit-background-clip: text;
      }
    }

    .logo-small {
      margin: auto;
      height: calc(#{$header-height} - 20px);
      clip-path: polygon(
        18% 4%,
        95% 50%,
        95% 50%,
        95% 50%,
        95% 50%,
        95% 50%,
        18% 96%
      );
      transform: scale(0.6) translateY(-2px);
      transition: clip-path 300ms $intro-easing, transform 300ms linear;
    }

    @media screen and (max-width: $mobile-width) {
      .logo {
        width: 0;
      }

      .logo-small {
        display: block;
        transform: scale(1);

        &.inverted {
          clip-path: polygon(
            18% 50%,
            95% 4%,
            95% 29%,
            60% 50%,
            95% 71%,
            95% 96%,
            18% 50%
          );
          transform: scale(0.8);
        }
      }
    }
  }

  .nav {
    margin: auto 10px auto 5px;
    color: $theme-color;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .menu {
      position: fixed;
      top: $header-height;
      right: 0;
      background-color: $bgcolor-alt;
      margin: -10px 20px 0 0;
      border-radius: 3px;
      box-shadow: $max-shadow;
      padding: 10px 0;

      .account-menu {
        height: 50px;
        display: flex;
        flex-direction: row;
        padding: 0 0 0 10px;
        align-items: flex-start;

        .account-info {
          display: flex;
          flex-direction: column;
          margin: 0 0 0 10px;
          width: 100%;

          .account-name {
            margin: 0 0 0 13px;
            width: 100%;
            color: $title-color;
          }

          .logout-btn {
            font-size: 0.9rem;
            width: 100%;
            margin: 0 0 0 10px;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      a.menu-btn {
        width: auto;
        border-radius: 0;
        margin: 0;
        padding: 6px 10px 2px 10px;
        display: flex;

        span {
          margin: 0 20px 0 0;

          svg {
            bottom: -0.1rem !important;
          }
        }

        p.menu-subtitle {
          font-size: 0.8rem;
        }

        &:hover,
        &:active,
        &:focus {
          background-color: $bgcolor-alt-light !important;
        }

        &.account-btn {
          display: none;

          @media screen and (max-width: $mobile-width) {
            display: block;
          }
        }
      }
    }

    a:not(.nav-btn) {
      text-decoration: none;
      color: $theme-color;
      margin: 0 6px;
      display: flex;
      user-select: none;
      border-radius: 50%;
      padding: 3px;
      width: 24px;
      height: 24px;
      order: 99;

      i {
        margin: auto;
        height: 100%;
      }
    }

    .nav-btn {
      text-decoration: none;
      color: $theme-color;
      margin: 0 5px;
      display: flex;
      user-select: none;
      border-radius: 5px;
      line-height: 100%;
      text-align: center;
      padding: 5px 10px;
      box-sizing: border-box;
      border: solid 2px transparent;

      @media screen and (max-width: $mobile-width) {
        display: none;
      }
    }

    .nav-btn.main {
      border: solid 2px $theme-color;
      border-radius: 3px;
    }

    #open-in-yt {
      .yt-logo {
        width: 100%;
        fill: #fff;

        .st0 {
          fill: $theme-color;
        }

        .st1 {
          fill: $header-bgcolor;
        }
      }
    }
  }

  a {
    outline: 0;

    &:hover,
    &:focus,
    &:target {
      outline: 0;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      background-color: transparent;
    }
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    &:active {
      background-color: transparent !important;
    }
  }
}
</style>
