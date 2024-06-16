<script setup lang="ts">
import { useUserStore } from '~/store/user';

const userStore = useUserStore();
</script>

<template>
  <div class="user-menu">
    <div class="user-account">
      <div class="user-avatar">
        <img
          v-if="userStore.profileImage"
          class="user-img"
          :src="userStore.profileImage"
          alt="User avatar"
        />
        <VTIcon v-else class="user-icon" name="mdi:account-circle" />
      </div>
      <div v-if="userStore.isLoggedIn" class="user-info">
        <div class="user-name">{{ userStore.username }}</div>
        <div class="user-role">{{ userStore.admin ? 'Admin' : 'User' }}</div>
      </div>
      <div v-else class="user-info">
        <div class="not-logged-in">Not logged in</div>
      </div>
    </div>
    <div class="page-navigation">
      <nuxt-link v-if="!userStore.isLoggedIn" class="page-link" to="/login">
        <VTIcon name="mdi:login-variant" />
        <span>Sign in</span>
      </nuxt-link>
      <nuxt-link v-if="!userStore.isLoggedIn" class="page-link" to="/register">
        <VTIcon name="mdi:register" />
        <span>Sign up</span>
      </nuxt-link>
      <HeaderCategoryHeader v-if="userStore.isLoggedIn">You</HeaderCategoryHeader>
      <nuxt-link v-if="userStore.isLoggedIn" class="page-link" to="/profile">
        <VTIcon name="mdi:account" />
        <span>Profile</span>
      </nuxt-link>
      <nuxt-link v-if="userStore.isLoggedIn" class="page-link" to="/subscriptions">
        <VTIcon name="mdi:youtube-subscription" />
        <span>Subscriptions</span>
      </nuxt-link>
      <nuxt-link v-if="userStore.isLoggedIn" class="page-link" to="/history">
        <VTIcon name="mdi:history" />
        <span>History</span>
      </nuxt-link>
      <nuxt-link v-if="userStore.isLoggedIn" class="page-link" to="/profile">
        <VTIcon name="mdi:pencil-box-multiple-outline" />
        <span>Manage subscriptions</span>
      </nuxt-link>
      <HeaderCategoryHeader>Manage</HeaderCategoryHeader>
      <button class="page-link" to="/settings">
        <VTIcon name="mdi:cog" /><span>Settings</span>
      </button>
      <nuxt-link v-if="userStore.isLoggedIn && userStore.admin" class="page-link" to="/account">
        <VTIcon name="mdi:administrator" />
        <span>Admin panel</span>
      </nuxt-link>
      <button v-if="userStore.isLoggedIn" class="page-link" to="/logout">
        <VTIcon name="mdi:logout-variant" />Logout
      </button>
      <HeaderCategoryHeader>Other</HeaderCategoryHeader>
      <button class="page-link" to="/settings">
        <VTIcon name="mdi:information-outline" /><span>About</span>
      </button>
      <button class="page-link" to="/settings">
        <VTIcon name="mdi:heart" /><span>Donate</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-menu {
  position: fixed;
  top: $header-height + 15px;
  right: 20px;
  width: calc(100% - 40px);
  max-width: 350px;
  z-index: 1000;
  background-color: var(--bgcolor-alt);
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;

  @media screen and (max-width: $mobile-width) {
    max-width: 100%;
  }

  .user-account {
    display: grid;
    grid-template-columns: 50px 1fr;
    grid-template-rows: 50px;
    gap: 10px;
    background-color: var(--bgcolor-alt);
    padding: 15px;
    border-radius: 12px 12px 0 0;
    transition: background-color 200ms $intro-easing;

    .user-avatar {
      .user-icon {
        width: 100%;
        height: 100%;
        color: var(--theme-color);
      }

      .user-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;

      .user-name {
        font-size: 1.1rem;
        color: var(--theme-color);
      }

      .user-role {
        font-size: 0.8rem;
        color: var(--subtitle-color-light);
      }

      .not-logged-in {
        margin: auto 0;
        color: var(--theme-color);
      }
    }
  }

  .page-navigation {
    display: flex;
    flex-direction: column;

    .page-link {
      padding: 10px 15px;
      margin: auto 0;
      display: flex;
      gap: 15px;
      transition: color 200ms $intro-easing;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      user-select: none;
      background-color: unset;
      color: var(--subtitle-color);
      border: none;

      &:hover {
        color: var(--theme-color);
      }

      &:last-child {
        border-radius: 0 0 12px 12px;
      }
    }
  }
}
</style>
