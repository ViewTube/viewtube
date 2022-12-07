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
      v-for="(link, index) in [...bannerLinks.primaryLinks, ...bannerLinks.secondaryLinks]"
      :key="index"
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

  .banner-links {
    display: flex;
    flex-direction: row;
    margin: 8px 0 0 0;

    .banner-link {
      background-color: #0000008f;
      padding: 5px 6px;
      border-radius: 5px;
      margin: 0 5px 5px 0;
      transition: background-color 200ms $intro-easing;
      text-align: center;
      line-height: 20px;
      height: 22px;
      display: flex;

      .link-thumbnail {
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        height: 16px;
      }

      &:focus {
        background-color: #00000083;
        &::after {
          display: none;
        }
      }
    }
  }
}
</style>
