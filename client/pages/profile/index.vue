<template>
  <div class="profile">
    <Spinner v-if="$fetchState.pending" class="centered" />
    <div v-if="profile" class="user-info">
      <div class="profile-img">
        <AccountCircleIcon />
      </div>
      <div class="user-name">
        <p>{{ profile.username }}</p>
      </div>
    </div>
    <div v-if="profile" class="actions">
      <BadgeButton :click="onLogoutPopup" style="color: #ef4056">Logout</BadgeButton>
    </div>
    <div v-if="profile" class="statistics">
      <p>
        <span class="highlight">{{ profile.totalVideosCount }} videos</span> watched
      </p>
      <p>
        <span class="highlight">{{ profile.totalTimeString }}</span> spent watching videos
      </p>
      <p>
        <span class="highlight">{{ profile.subscribedChannelsCount }} channels</span> subscribed to
      </p>
    </div>
    <portal to="popup">
      <transition name="popup">
        <Confirmation
          v-if="logoutPopup"
          :title="'Logout'"
          :message="'Do you want to log out?'"
          @close="() => (logoutPopup = false)"
        >
          <BadgeButton :click="() => (logoutPopup = false)">Cancel</BadgeButton>
          <BadgeButton :click="logout">OK</BadgeButton>
        </Confirmation>
      </transition>
    </portal>
  </div>
</template>

<script lang="ts">
import Spinner from '@/components/Spinner.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import AccountCircleIcon from 'vue-material-design-icons/AccountCircle.vue';
import Confirmation from '@/components/popup/Confirmation.vue';

import Vue from 'vue';
export default Vue.extend({
  name: 'Profile',
  components: {
    Spinner,
    BadgeButton,
    AccountCircleIcon,
    Confirmation
  },
  data() {
    return {
      profile: null,
      logoutPopup: false
    };
  },
  async fetch() {
    if (this.$store.getters['user/isLoggedIn']) {
      const apiUrl = this.$store.getters['environment/apiUrl'];
      await this.$axios
        .get(`${apiUrl}user/profile/details`)
        .then(result => {
          if (result) {
            this.profile = result.data;
          }
        })
        .catch(_ => {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Error loading profile',
            message: 'Try logging out and in again'
          });
        });
    } else {
      this.$nuxt.context.redirect('/login');
    }
  },
  head() {
    return {
      title: `${this.profile ? this.profile.username + ' :: ' : ''}Profile :: ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'See your profile'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Your profile'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'See your profile'
        }
      ]
    };
  },
  methods: {
    onLogoutPopup() {
      this.logoutPopup = true;
    },
    onLogoutPopupClose() {
      this.logoutPopup = false;
    },
    logout() {
      this.$store.dispatch('user/logout');
      this.$router.push('/');
    }
  }
});
</script>

<style lang="scss">
.popup-enter-active,
.popup-leave-active {
  transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;
}
.popup-enter-to,
.popup-leave {
  opacity: 1;
  transform: scale(1);
}
.popup-enter,
.popup-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.profile {
  width: 100%;
  max-width: 500px;
  padding-top: $header-height;
  margin: 0 auto;

  .user-info {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 10px 0 0 0;

    .profile-img {
      .material-design-icon {
        width: 56px;
        height: 56px;
        .material-design-icon__svg {
          width: 56px;
          height: 56px;
        }
      }
    }
    .user-name {
      padding: 5px 0 0 10px;
      font-size: 1.8rem;
    }
  }

  .statistics {
    .highlight {
      color: var(--theme-color);
    }
  }
}
</style>
