<template>
  <div class="compact-shelf">
    <SectionTitle :title="data.title" />
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

<script lang="ts">
import Commons from '@/plugins/commons.ts';
import SectionTitle from '@/components/SectionTitle.vue';

import Vue from 'vue';

export default Vue.extend({
  name: 'CompactShelf',
  components: {
    SectionTitle
  },
  props: {
    data: Object
  },
  data() {
    return {
      commons: Commons
    };
  }
});
</script>

<style></style>
