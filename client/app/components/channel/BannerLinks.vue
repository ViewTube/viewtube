<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';
import BadgeButton from '../buttons/BadgeButton.vue';

defineProps<{
  links: Array<ApiDto<'VTChannelLinkDto'>>;
}>();

const { proxyUrl } = useImgProxy();
</script>

<template>
  <div class="banner-links">
    <div class="banner-links-inner">
      <BadgeButton v-for="link in links" :key="link.url" class="banner-link" :href="link.url">
        <img
          v-if="link.favicons?.length"
          :src="proxyUrl(link.favicons[link.favicons.length - 1].url)"
          :alt="link.title"
          class="link-thumbnail"
        />
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
