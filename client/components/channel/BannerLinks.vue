<script setup lang="ts">
import BadgeButton from '../buttons/BadgeButton.vue';

defineProps<{
  bannerLinks: {
    primaryLinks?: Array<{
      url: string;
      icon: string;
      title: string;
    }>;
    secondaryLinks?: Array<{
      url: string;
      icon: string;
      title: string;
    }>;
    type: string;
  };
}>();

const imgProxy = useImgProxy();
</script>

<template>
  <div class="banner-links-container">
    <BadgeButton
      v-for="(link, index) in [
        ...(bannerLinks.primaryLinks ?? []),
        ...(bannerLinks.secondaryLinks ?? [])
      ]"
      :key="index"
      class="banner-link"
      :href="link.url"
    >
      <img
        v-if="link.icon"
        :src="imgProxy.url + link.icon"
        :alt="link.title"
        class="link-thumbnail"
      />
      {{ link.title }}
    </BadgeButton>
  </div>
</template>

<style lang="scss">
.banner-links-container {
  display: flex;
  margin: 10px;

  .banner-link {
    .link-thumbnail {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      position: relative;
      top: 1px;
    }
  }
}
</style>
