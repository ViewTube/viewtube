<template>
  <div class="related-searches">
    <SectionTitle :title="'Related queries'" />
    <div class="related-keywords">
      <nuxt-link
        v-for="(refinement, index) in refinements"
        :key="index"
        class="related-search-tag"
        :to="`results?search_query=${refinement.q}`"
      >
        <img
          v-if="refinement.bestThumbnail"
          :src="imgProxyUrl + refinement.bestThumbnail.url"
          alt="Refinement image"
        />
        <p>{{ refinement.q.charAt(0).toUpperCase() + refinement.q.slice(1) }}</p>
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '#imports';
import SectionTitle from '@/components/SectionTitle.vue';
import { useImgProxy } from '@/utilities/proxy';

export default defineComponent({
  name: 'RelatedSearches',
  components: {
    SectionTitle
  },
  props: {
    refinements: Array
  },
  setup() {
    const imgProxy = useImgProxy();
    return {
      imgProxyUrl: imgProxy.url
    };
  }
});
</script>

<style lang="scss">
.related-searches {
  box-sizing: border-box;
  width: 100%;
  position: relative;

  .related-keywords {
    scrollbar-width: thin;
    overflow: auto hidden;
    display: flex;
    flex-direction: row;
    width: auto;
    height: 200px;

    @media screen and (max-width: $mobile-width) {
      height: 160px;
    }

    .related-search-tag {
      display: flex;
      flex-direction: column;
      margin: 10px 20px 10px 0;
      padding: 0;
      // overflow: clip;
      width: 220px;
      position: relative;
      border-radius: 5px;

      @media screen and (max-width: $mobile-width) {
        width: 160px;
      }

      p {
        position: relative;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 32px;
        padding: 3px 0 2px 0;
        box-sizing: border-box;
      }

      img {
        border-radius: 5px;
        display: block;
        position: relative;
        box-shadow: $medium-shadow;

        &:hover {
          &::after {
            box-shadow: 0 0 0 2px var(--theme-color);
          }
        }
      }
    }
  }
}
</style>
