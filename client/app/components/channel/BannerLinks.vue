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

const { proxyUrl } = useImgProxy();
</script>

<template>
  <div class="banner-links">
    <div class="banner-links-inner">
      <BadgeButton
        v-for="(link, index) in [
          ...(bannerLinks.primaryLinks ?? []),
          ...(bannerLinks.secondaryLinks ?? [])
        ]"
        :key="index"
        class="banner-link"
        :href="link.url"
      >
        <img v-if="link.icon" :src="proxyUrl(link.icon)" :alt="link.title" class="link-thumbnail" />
        {{ link.title }}
      </BadgeButton>
    </div>
  </div>
</template>

<style lang="scss">
.banner-links {
  position: relative;
  height: 40px;
  overflow: auto hidden;

  .banner-links-inner {
    position: absolute;
    display: flex;

    .banner-link {
      .link-thumbnail {
        width: 24px;
        height: 24px;
        position: relative;
        top: 1px;
      }
    }
  }
}
</style>
