<template>
  <div
    class="header"
    :class="{ hidden: $store.state.scroll.scrollDown }"
  >
    <nuxt-link
      class="logo-link"
      to="/"
    >
      <h1 class="logo">
        <span>View</span>
        <span class="logo-colored">Tube</span>
      </h1>
      <img
        class="logo-small"
        :class="{ inverted: currentRouteName!=='home' }"
        src="@/assets/icon.svg"
        alt="ViewTube"
      >
    </nuxt-link>
    <MainSearchBox />
    <div class="nav">
      <nuxt-link
        v-if="!userAuthenticated"
        id="login"
        v-ripple
        to="/login"
        class="tooltip nav-btn main"
        data-tippy-content="login"
      >Login</nuxt-link>
      <nuxt-link
        v-if="!userAuthenticated"
        id="register"
        v-ripple
        to="/register"
        class="tooltip nav-btn"
        data-tippy-content="register"
      >Register</nuxt-link>
      <nuxt-link
        v-show="userAuthenticated"
        id="subscriptions"
        v-ripple
        to="/subscriptions"
        class="tooltip nav-btn main"
        data-tippy-content="view your subscriptions"
      >Subscriptions</nuxt-link>
      <a
        id="account"
        v-ripple
        href="#"
        class="tooltip"
        data-tippy-content="account"
        @click="showAccountMenu"
      >
        <AccountIcon />
      </a>
      <transition name="circle">
        <div
          v-if="accountMenuVisible"
          v-clickaway="hideAccountMenu"
          class="menu"
        >
          <a
            v-if="!userAuthenticated"
            id="login-btn"
            href="#"
            class="ripple tooltip menu-btn account-btn"
            data-tippy-content="login"
            @click.self.prevent="login"
          >
            <AccountIcon />Login
          </a>
          <a
            v-if="!userAuthenticated"
            id="login-btn"
            href="#"
            class="ripple tooltip menu-btn account-btn"
            data-tippy-content="register"
            @click.self.prevent="register"
          >
            <AccountPlusIcon />Register
          </a>
          <a
            v-if="this.$route.name !== 'subscriptions' && userAuthenticated"
            id="subscriptions-btn"
            href="#"
            class="ripple tooltip menu-btn"
            data-tippy-content="view your subscriptions"
            @click.self.prevent="openSubscriptions"
          >
            <AccountPlusIcon />Subscriptions
          </a>
          <div
            v-if="userAuthenticated"
            class="account-menu"
          >
            <AccountIcon />
            <div class="account-info">
              <p class="account-name">{{ $store.getters['user/username'] }}</p>
              <a
                class="logout-btn"
                href="#"
                @click.prevent="logout"
              >Log out</a>
            </div>
          </div>
          <a
            id="share"
            href="#"
            class="ripple tooltip menu-btn"
            data-tippy-content="share"
            @mousedown.self.prevent="share"
          >
            <ShareIcon />share
          </a>
          <a
            id="settings-btn"
            href="#"
            class="ripple tooltip menu-btn"
            data-tippy-content="open settings"
            @mousedown.self.prevent="openSettings"
          >
            <SettingsIcon />settings
          </a>
          <a
            id="about-btn"
            href="#"
            class="ripple tooltip menu-btn"
            data-tippy-content="open about"
            @mousedown.self.prevent="openAbout"
          >
            <AboutIcon />about
          </a>
        </div>
      </transition>
    </div>
    <transition name="fade-down">
      <Settings
        v-if="settingsOpen"
        @close="closeSettings"
      />
      <About
        v-if="aboutOpen"
        @close="closeAbout"
      />
    </transition>
  </div>
</template>

<script>
import ShareIcon from 'vue-material-design-icons/Share'
import SettingsIcon from 'vue-material-design-icons/Cog'
import AboutIcon from 'vue-material-design-icons/InformationOutline'
import AccountIcon from 'vue-material-design-icons/AccountCircle'
import AccountPlusIcon from 'vue-material-design-icons/AccountPlus'
import MainSearchBox from '@/components/MainSearchBox'
import Settings from '@/components/Settings'
import About from '@/components/About'

export default {
  name: 'Header',
  components: {
    ShareIcon,
    SettingsIcon,
    AboutIcon,
    AccountIcon,
    AccountPlusIcon,
    MainSearchBox,
    Settings,
    About
  },
  props: {
    scrollTop: Boolean
  },
  data: () => ({
    accountMenuVisible: false,
    settingsOpen: false,
    aboutOpen: false
  }),
  computed: {
    currentRouteName() {
      return this.$route.name
    },
    userAuthenticated() {
      return this.$store.getters['user/isLoggedIn']
    }
  },
  mounted() {
  },
  methods: {
    hideAccountMenu() {
      if (this.accountMenuVisible) {
        setTimeout(() => {
          this.accountMenuVisible = false
        }, 200)
      }
    },
    share() {
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
    showAccountMenu() {
      this.accountMenuVisible = !this.accountMenuVisible
    },
    openAbout() {
      this.hideAccountMenu()
      this.aboutOpen = true
    },
    closeAbout() {
      this.aboutOpen = false
    },
    openSettings() {
      this.hideAccountMenu()
      this.settingsOpen = true
    },
    closeSettings() {
      this.settingsOpen = false
    },
    openSubscriptions() {
      this.$router.push('/subscriptions')
      this.hideAccountMenu()
    },
    login() {
      this.$router.push('/login')
      this.hideAccountMenu()
    },
    register() {
      this.$router.push('/register')
      this.hideAccountMenu()
    },
    logout() {
      this.$store.dispatch('user/logout')
      this.hideAccountMenu()
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

.fade-down-enter-active,
.fade-down-leave-active {
  transition: transform 200ms $intro-easing, opacity 200ms $intro-easing;
}
.fade-down-enter-to,
.fade-down-leave {
  transform: scale(1);
  opacity: 1;
}
.fade-down-enter,
.fade-down-leave-to {
  transform: scale(1.1);
  opacity: 0;
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
  box-shadow: $medium-shadow;
  background-color: var(--header-bgcolor);

  transition: box-shadow 300ms $intro-easing,
    background-color 300ms $intro-easing, transform 300ms $dynamic-easing;

  &.hidden {
    transform: translate3d(0, -$header-height - 20px, 0);
  }

  .logo-link {
    text-decoration: none;
    margin: auto 10px auto 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    position: relative;
    z-index: +1;

    .logo {
      font-family: $header-font;
      font-size: 1.5rem;
      color: var(--title-color);
      width: auto;
      overflow: hidden;
      white-space: nowrap;
      transition: width 300ms linear;
      display: flex;
      margin: 4px 0 0 0;

      span {
        display: block;
      }

      .logo-colored {
        color: transparent;
        background-image: var(--theme-color-gradient);
        background-clip: text;
        -webkit-background-clip: text;
      }
    }

    .logo-small {
      margin: auto;
      height: calc(#{$header-height} - 20px);
      transform: scale(0.8) translateY(-2px);
      transition: clip-path 300ms $intro-easing, transform 300ms linear;
    }

    @media screen and (max-width: $mobile-width) {
      .logo {
        width: 0;
      }

      .logo-small {
        display: block;
        transform: scale(1);
      }
    }
  }

  .nav {
    margin: auto 10px auto 5px;
    color: var(--theme-color);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    z-index: +1;

    .menu {
      position: fixed;
      top: $header-height;
      right: 0;
      background-color: var(--bgcolor-alt);
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
            color: var(--title-color);
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
          background-color: var(--bgcolor-alt-light) !important;
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
      color: var(--theme-color);
      transition: color 300ms $intro-easing;
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
      color: var(--theme-color);
      transition: color 300ms $intro-easing;
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
      border: solid 2px var(--theme-color);
      border-radius: 3px;
    }

    #open-in-yt {
      .yt-logo {
        width: 100%;
        fill: #fff;

        .st0 {
          fill: var(--theme-color);
        }

        .st1 {
          fill: var(--header-bgcolor);
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
