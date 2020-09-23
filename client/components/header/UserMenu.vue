<template>
  <div class="nav">
    <nuxt-link
      v-show="!userAuthenticated"
      id="login"
      v-ripple
      v-tippy="'Login'"
      to="/login"
      class="tooltip nav-btn main"
      >Login</nuxt-link
    >
    <nuxt-link
      v-show="!userAuthenticated"
      id="register"
      v-ripple
      v-tippy="'Register'"
      to="/register"
      class="tooltip nav-btn"
      >Register</nuxt-link
    >
    <nuxt-link
      v-show="this.$route.name !== 'subscriptions' && userAuthenticated"
      id="subscriptions"
      v-ripple
      v-tippy="'View your subscriptions'"
      to="/subscriptions"
      class="tooltip nav-btn main"
      >Subscriptions</nuxt-link
    >
    <a
      id="account"
      v-ripple
      v-tippy="'Account'"
      :class="{ authenticated: userAuthenticated }"
      href="#"
      @click="showAccountMenu"
    >
      <AccountIcon />
    </a>
    <transition name="fade-up">
      <div v-if="accountMenuVisible" v-clickaway="hideAccountMenu" class="menu">
        <div v-show="userAuthenticated" class="account-menu">
          <AccountIcon />
          <div class="account-info">
            <p class="account-name">
              Logged in as
              {{ $store.getters['user/username'] }}
            </p>
            <a class="logout-btn" href="#" @click.prevent="logout">Log out</a>
          </div>
        </div>
        <div class="menu-buttons" :class="{ authenticated: userAuthenticated }">
          <a
            v-show="!userAuthenticated"
            id="login-btn"
            v-tippy="'Login'"
            href="#"
            class="ripple tooltip menu-btn account-btn"
            @click.self.prevent="login"
          >
            <div class="menu-btn-content"><AccountIcon />Login</div>
          </a>
          <a
            v-show="!userAuthenticated"
            id="login-btn"
            v-tippy="'Register'"
            href="#"
            class="ripple tooltip menu-btn account-btn"
            @click.self.prevent="register"
          >
            <div class="menu-btn-content"><AccountPlusIcon />Register</div>
          </a>
          <a
            v-if="this.$route.name !== 'subscriptions' && userAuthenticated"
            id="subscriptions-btn"
            v-tippy="'View your subscriptions'"
            href="#"
            class="ripple tooltip menu-btn"
            @click.self.prevent="openSubscriptions"
          >
            <div class="menu-btn-content"><AccountPlusIcon />Subscriptions</div>
          </a>
          <a
            id="settings-btn"
            v-tippy="'Open settings'"
            href="#"
            class="ripple tooltip menu-btn"
            @mousedown.self.prevent="openSettings"
          >
            <div class="menu-btn-content"><SettingsIcon />settings</div>
          </a>
          <a
            id="instances-btn"
            v-tippy="'View instances'"
            href="#"
            class="ripple tooltip menu-btn"
            @mousedown.self.prevent="openInstances"
          >
            <div class="menu-btn-content"><InstanceIcon />instances</div>
          </a>
          <a
            id="themes-btn"
            v-tippy="'Select Theme'"
            href="#"
            class="ripple tooltip menu-btn"
            @mousedown.self.prevent="openThemes"
          >
            <div class="menu-btn-content"><ThemeIcon />theme</div>
          </a>
          <a
            id="about-btn"
            v-tippy="'Open about'"
            href="#"
            class="ripple tooltip menu-btn"
            @mousedown.self.prevent="openAbout"
          >
            <div class="menu-btn-content"><AboutIcon />about</div>
          </a>
        </div>
      </div>
    </transition>
    <portal to="popup">
      <transition name="fade-down">
        <Settings v-if="settingsOpen" @close="closeSettings" />
        <Instances v-if="instancesOpen" @close="closeInstances" />
        <Themes v-if="themesOpen" @close="closeThemes" />
        <About v-if="aboutOpen" @close="closeAbout" />
      </transition>
    </portal>
    <div :class="{ visible: accountMenuVisible }" class="clickaway-div" />
  </div>
</template>

<script>
import SettingsIcon from 'vue-material-design-icons/Cog';
import InstanceIcon from 'vue-material-design-icons/ServerNetwork';
import ThemeIcon from 'vue-material-design-icons/Palette';
import AboutIcon from 'vue-material-design-icons/InformationOutline';
import AccountIcon from 'vue-material-design-icons/AccountCircle';
import AccountPlusIcon from 'vue-material-design-icons/AccountPlus';
import Settings from '@/components/Settings';
import Instances from '@/components/Instances';
import Themes from '@/components/Themes';
import About from '@/components/About';

export default {
  name: 'UserMenu',
  components: {
    SettingsIcon,
    InstanceIcon,
    ThemeIcon,
    AboutIcon,
    AccountIcon,
    AccountPlusIcon,
    Settings,
    Instances,
    Themes,
    About
  },
  data: () => ({
    accountMenuVisible: false,
    settingsOpen: false,
    instancesOpen: false,
    themesOpen: false,
    aboutOpen: false
  }),
  computed: {
    currentRouteName() {
      return this.$route.name;
    },
    userAuthenticated() {
      return this.$store.getters['user/isLoggedIn'];
    }
  },
  methods: {
    hideAccountMenu() {
      if (this.accountMenuVisible) {
        this.accountMenuVisible = false;
      }
    },
    share() {
      if (typeof navigator.share === 'function') {
        navigator
          .share({
            title: document.title,
            text: 'Hello World',
            url: window.location.href
          })
          .then(() => console.log('Successful share'))
          .catch(error => console.log('Error sharing:', error));
      }
      this.hideAccountMenu();
    },
    showAccountMenu() {
      this.accountMenuVisible = !this.accountMenuVisible;
    },
    openAbout() {
      this.hideAccountMenu();
      this.aboutOpen = true;
    },
    closeAbout() {
      this.aboutOpen = false;
    },
    openSettings() {
      this.hideAccountMenu();
      this.settingsOpen = true;
    },
    closeSettings() {
      this.settingsOpen = false;
    },
    openInstances() {
      this.hideAccountMenu();
      this.instancesOpen = true;
    },
    closeInstances() {
      this.instancesOpen = false;
    },
    openThemes() {
      this.hideAccountMenu();
      this.themesOpen = true;
    },
    closeThemes() {
      this.themesOpen = false;
    },
    openSubscriptions() {
      this.$router.push('/subscriptions');
      this.hideAccountMenu();
    },
    login() {
      this.$router.push('/login');
      this.hideAccountMenu();
    },
    register() {
      this.$router.push('/register');
      this.hideAccountMenu();
    },
    logout() {
      this.$store.dispatch('user/logout');
      this.hideAccountMenu();
    }
  }
};
</script>

<style lang="scss">
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;
}
.fade-up-enter-to,
.fade-up-leave {
  opacity: 1;
  transform: translateY(0);
}
.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(50px);
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

.clickaway-div {
  position: fixed;
  background-color: #0000008f;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 300ms $intro-easing;

  &.visible {
    opacity: 1;
    pointer-events: all;
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

  #account {
    color: var(--subtitle-color-light);

    &.authenticated {
      color: var(--theme-color);
    }
  }

  .menu {
    position: fixed;
    top: $header-height;
    right: 0;
    background-color: var(--bgcolor-alt);
    backdrop-filter: blur(15px);
    margin: 0 20px 0 0;
    border-radius: 3px;
    box-shadow: $max-shadow;
    padding: 10px 0 20px 0;
    width: 260px;
    height: auto;
    box-sizing: border-box;

    @media screen and (max-width: $mobile-width) {
      top: 100%;
      right: 0;
      left: 0;
      width: 100%;
      transform: translate(0, -100%);
    }

    .menu-buttons {
      display: grid;
      grid-template-columns: 45% 45%;
      column-gap: 10%;
      row-gap: 5%;
      height: auto;
      margin: 10px 5% 20px 5%;

      @media screen and (max-width: $mobile-width) {
        grid-template-columns: 25% 25% 25% 25%;
        grid-template-rows: 70% !important;
        column-gap: 0 !important;
        row-gap: 0 !important;
        margin: 0 10px !important;

        &:not(.authenticated) {
          grid-template-columns: 20% 20% 20% 20% 20% !important;
        }

        .menu-btn {
          height: 80px !important;
        }
      }

      a.menu-btn {
        width: auto;
        border-radius: 0;
        margin: 0;
        justify-self: center;
        align-self: stretch;
        width: 100%;
        height: 50px;
        display: flex;
        border-radius: 5px;
        transition: box-shadow 300ms $intro-easing, border 300ms $intro-easing;
        border: 2px solid transparent;

        &:hover,
        &:active,
        &:focus {
          box-shadow: $low-shadow;
          border: 2px solid var(--theme-color);
        }

        .menu-btn-content {
          margin: auto;
          display: flex;
          flex-direction: column;

          span {
            margin: auto;
            width: 28px;
            height: 28px;

            svg {
              width: 28px;
              height: 28px;
            }
          }

          p.menu-subtitle {
            font-size: 0.8rem;
          }

          &.account-btn {
            display: none;

            @media screen and (max-width: $mobile-width) {
              display: block;
            }
          }
        }
      }
    }

    .account-menu {
      height: 50px;
      display: flex;
      flex-direction: row;
      padding: 0 0 0 20px;
      align-items: flex-start;

      .account-info {
        display: flex;
        flex-direction: column;
        margin: 0 0 0 0;
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
  }

  a:not(.nav-btn):not(.menu-btn) {
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
</style>
