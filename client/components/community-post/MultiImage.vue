<script setup lang="ts">
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';

defineProps<{
  postImages: Array<
    Array<{
      url: string;
      width: number;
      height: number;
    }>
  >;
}>();

const modules = [Navigation];
</script>

<template>
  <div class="multi-image">
    <swiper :modules="modules" :navigation="(true as any)">
      <swiper-slide v-for="(image, index) in postImages" :key="index">
        <CommunityPostImage :post-image="image" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<style lang="scss" scoped>
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: var(--theme-color);
}
:deep(.swiper-button-disabled) {
  display: none;
}
</style>
