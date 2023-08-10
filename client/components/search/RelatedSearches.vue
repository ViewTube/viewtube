<script setup lang="ts">
import BadgeButton from '@/components/buttons/BadgeButton.vue';
defineProps<{
  refinements: string[];
}>();
</script>

<template>
  <div class="related-searches">
    <SectionSubtitle :title="'Related queries'" />
    <div class="related-keywords">
      <div class="keywords-container">
        <BadgeButton
          v-for="(refinement, index) in refinements"
          :key="index"
          :internal-link="true"
          class="related-search-tag"
          :href="`results?search_query=${refinement}`"
        >
          <p>{{ refinement }}</p>
        </BadgeButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.related-searches {
  box-sizing: border-box;
  width: 100%;
  position: relative;

  .related-keywords {
    margin: 5px auto 0 auto;
    width: 100%;
    height: 40px;
    overflow: auto hidden;
    scrollbar-width: thin;
    box-sizing: border-box;
    position: relative;

    .keywords-container {
      display: flex;
      flex-direction: row;
      width: auto;
      position: absolute;

      .related-search-tag {
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
}
</style>
