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
    <div class="search-box">
      <input
        type="search"
        name="search"
        id="search"
        placeholder="search"
        :value="$route.query.search_query !== undefined ? $route.query.search_query : ''"
      />
      <a
        href="#"
        v-on:click.self.prevent="search"
        class="search-btn ripple tooltip"
        data-tippy-content="click or press enter to search"
      >
        <SearchIcon />
      </a>
      <div class="search-autocomplete-container"></div>
    </div>
    <div class="nav">
      <a
        href="#"
        v-on:click.self.prevent="accountMenuVisible = !accountMenuVisible"
        id="account"
        class="ripple tooltip"
        data-tippy-content="account"
      >
        <AccountIcon />
      </a>
      <div class="menu" v-if="accountMenuVisible" v-on-clickaway="hideAccountMenu">
        <a
          href="#"
          v-on:click.self.prevent="openInYT"
          id="open-in-yt"
          class="ripple tooltip"
          data-tippy-content="view on youtube (hold alt for invidio.us)"
        >
          <YoutubeIcon />open in youtube
        </a>
        <a
          href="#"
          v-on:click.self.prevent="share"
          id="share"
          class="ripple tooltip"
          data-tippy-content="share"
        >
          <ShareIcon />share
        </a>
        <a
          href="#"
          v-on:click.self.prevent="openSettings"
          id="settings-btn"
          class="ripple tooltip"
          data-tippy-content="open settings"
        >
          <SettingsIcon />settings
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import ShareIcon from 'icons/Share.vue'
import SettingsIcon from 'icons/Settings.vue'
import SearchIcon from 'icons/Magnify.vue'
import AccountIcon from 'icons/AccountCircle'
import YoutubeIcon from 'icons/Youtube'
import tippy from 'tippy.js'
import { mixin as clickaway } from 'vue-clickaway'

export default {
  name: 'Header',
  components: {
    ShareIcon,
    SettingsIcon,
    SearchIcon,
    AccountIcon,
    YoutubeIcon
  },
  mixins: [clickaway],
  data: function () {
    return {
      accountMenuVisible: false
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
    search: function () {

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
    }
  },
  mounted () {
    this.disableDrag()
    tippy('.tooltip', {
      animation: 'shift-away',
      animateFill: false,
      duration: 300,
      arrow: false,
      delay: [500, 100],
      touchHold: true,
      placement: 'bottom'
    })
  },
  computed: {
    currentRouteName () {
      return this.$route.name
    }
  }
}

</script>

<style lang="scss">
.header {
  height: $header-height;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  box-shadow: $low-shadow;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 800;
  background-color: $header-bgcolor;

  .logo-link {
    text-decoration: none;
    margin: auto 10px auto 10px;
    box-sizing: border-box;

    .logo {
      font-family: $header-font;
      font-size: 1.5rem;
      color: $subtitle-color;

      .logo-colored {
        color: transparent;
        background-image: $theme-color-gradient;
        background-clip: text;
        -webkit-background-clip: text;
      }
    }

    .logo-small {
      display: none;
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
      transform: scale(1);
      transition: clip-path 300ms $intro-easing, transform 300ms linear;

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

    @media screen and (max-width: $mobile-width) {
      .logo {
        display: none;
      }

      .logo-small {
        display: block;
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

      &:target {
        all: unset;
      }

      &:focus {
        outline: none;
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

      a {
        width: auto;
        border-radius: 0;
        margin: 0;
        padding: 6px 10px 2px 10px;

        span {
          margin: 0 20px 0 0;

          svg {
            bottom: -0.1rem !important;
          }
        }

        &:hover,
        &:active,
        &:focus {
          background-color: $bgcolor-alt-light !important;
        }
      }
    }

    a {
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
