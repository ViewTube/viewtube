<template>
  <div class="header" :class="{ scrolled: !scrolledTop }">
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
    <div class="search-box" :class="{ focused: searchFieldFocused }">
      <input
        type="search"
        name="search"
        id="search"
        ref="searchField"
        placeholder="search"
        @focus="onSearchFieldFocused"
        @blur="onSearchFieldBlur"
        @keydown="onSearchFieldKeydown"
        :value="$route.query.search_query !== undefined ? $route.query.search_query : ''"
      />
      <a
        href="#"
        @click.self.prevent="onSearchButton"
        class="search-btn ripple tooltip"
        data-tippy-content="click or press enter to search"
      >
        <SearchIcon />
      </a>
      <span class="search-line-bottom line"></span>
      <div class="search-autocomplete-container"></div>
    </div>
    <div class="nav">
      <router-link
        to="login"
        id="login"
        class="ripple tooltip nav-btn main"
        data-tippy-content="login"
        v-if="!userAuthenticated && !isRegisterOrLoginPage"
        v-html="'Login'"
      >Login</router-link>
      <router-link
        to="/register"
        id="register"
        class="ripple tooltip nav-btn"
        data-tippy-content="register"
        v-if="!userAuthenticated && !isRegisterOrLoginPage"
      >Register</router-link>
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
import SearchIcon from 'icons/Magnify.vue'
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
    SearchIcon,
    AccountIcon,
    YoutubeIcon,
    AccountPlusIcon
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
      loginState: UserStore.state,
      searchFieldFocused: false
    }
  },
  methods: {
    onSearchFieldFocused: function (e) {
      this.searchFieldFocused = true
    },
    onSearchFieldBlur: function (e) {
      this.searchFieldFocused = false
    },
    onSearchFieldKeydown: function (e) {
      let searchValue = e.target.value
      if (e.code === 'Enter' && searchValue !== '') {
        this.$router.push(`/results?search_query=${searchValue}`)
      }
    },
    onSearchButton: function () {
      let searchValue = this.$refs.searchField.value
      if (searchValue !== '') {
        this.$router.push(`/results?search_query=${searchValue}`)
      }
    },
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
    },
    isRegisterOrLoginPage () {
      return this.$route.name === 'register' | this.$route.name === 'login'
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

  &.scrolled {
    box-shadow: $max-shadow;
  }

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

  .search-box {
    display: flex;
    flex-direction: row;
    height: 50%;
    margin: auto;
    width: 100%;
    max-width: $search-box-width;
    justify-content: flex-end;
    background-color: rgba(128, 128, 128, 0.37);
    position: relative;

    .search-btn {
      text-decoration: none;
      color: $theme-color;
      width: 50px;
      text-align: center;
      display: flex;
      user-select: none;

      .material-design-icon {
        margin: auto;
      }
    }

    .search-autocomplete-container {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      margin-top: $header-height / 2;
      background-color: $header-bgcolor;
      display: flex;
      flex-direction: column;
      box-shadow: $medium-shadow;

      .search-autocomplete-entry {
        padding: 5px 0 5px 10px;
        cursor: default;
        color: $title-color;
        text-decoration: none;
        font-family: $default-font;

        &:hover,
        &.selected {
          background-color: $bgcolor-alt;
        }
      }

      &.hidden {
        display: none;
      }
    }

    #search {
      width: 100%;
      height: 100%;
      border: none;
      color: $title-color;
      font-size: 1rem;
      margin: 0 0 0 10px;
      min-width: 0px;
      visibility: visible;
      background-color: transparent;
      position: relative;

      &:target {
        all: unset;
      }

      &:focus {
        outline: none;
      }
    }

    &.focused {
      .line {
        transform: scale(1);
      }
    }

    .line {
      position: absolute;
      background-color: $theme-color;
      height: 1.5px;
      width: 1.5px;
      transform: scale(0);
      transition: transform 300ms $intro-easing;
    }

    .search-line-bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      transform-origin: left;
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
      border-radius: 3px;
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
