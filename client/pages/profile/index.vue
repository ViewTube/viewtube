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
  </div>
</template>

<script lang="ts">
import Spinner from '@/components/Spinner.vue';
import AccountCircleIcon from 'vue-material-design-icons/AccountCircle.vue';

import Vue from 'vue';
export default Vue.extend({
  name: 'Profile',
  components: {
    Spinner,
    AccountCircleIcon
  },
  data() {
    return {
      profile: null
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
    }
  }
});
</script>

<style lang="scss">
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
