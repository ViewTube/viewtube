<template>
  <div class="compact-shelf">
    <p class="shelf-title">{{ data.title }}</p>
    <div class="compact-shelf-elements">
      <div v-for="(element, index) in data.items" :key="index" class="shelf-element">
        <nuxt-link
          :to="'/watch?v=' + commons.getVideoIdFromUrl(element.ref)"
          class="thmb-container"
        >
          <img :src="element.thumbnail" alt="element.name" />
          <span class="duration">{{ data.duration }}</span>
        </nuxt-link>
        <div class="info-container">
          <nuxt-link
            nuxt-link
            :to="'/watch?v=' + commons.getVideoIdFromUrl(element.ref)"
            class="title"
            >{{ element.name }}</nuxt-link
          >
          <p v-if="data.price" class="price">{{ element.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js';

export default {
  name: 'CompactShelf',
  props: {
    data: Object
  },
  data() {
    return {
      commons: Commons
    };
  }
};
</script>

<style></style>
