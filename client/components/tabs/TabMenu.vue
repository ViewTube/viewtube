<template>
  <div class="tab-menu">
    <div class="tab-menu-inner">
      <div class="tabs">
        <div
          v-for="(tabName, id) in tabNames"
          :key="`tab-${id}`"
          :ref="`tab-${id}`"
          class="tab"
          :class="{ selected: selectedTab === id }"
          @click="e => onTabSelected(id, e)"
        >
          {{ tabName }}
        </div>
        <span
          class="tab-underline"
          :style="{
            width: `${tabUnderlineWidth}px`,
            left: `${tabUnderlineLeft}px`
          }"
        />
      </div>
      <div v-for="(tabName, id) in tabNames" :key="`tab-content-${id}`" class="tab-content">
        <div v-if="selectedTab === id" class="tab-content-inner">
          <slot :name="tabName" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabMenu',
  props: {
    tabNames: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    selectedTab: 0,
    tabUnderlineWidth: 0,
    tabUnderlineLeft: 0
  }),
  mounted() {
    if (this.$route.query.tab) {
      this.selectedTab = this.tabNames.findIndex((_, id) => id === this.$route.query.tab);
    }
  },
  methods: {
    onTabSelected(tabId, e) {
      this.tabUnderlineWidth = e.target.clientWidth;
      this.tabUnderlineLeft = e.target.offsetLeft;

      this.selectedTab = tabId;
    }
  }
};
</script>

<style lang="scss" scoped>
.fade-tabs-enter-active,
.fade-tabs-leave-active {
  transition: transform 300ms $intro-easing, opacity 300ms $intro-easing;
}
.fade-tabs-enter-to,
.fade-tabs-leave {
  transform: translateX(0%);
  opacity: 1;
}
.fade-tabs-enter,
.fade-tabs-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.tab-menu {
  width: 100%;
  height: 80px;

  .tab-menu-inner {
    .tabs {
      display: flex;
      flex-direction: row;
      position: relative;

      .tab-underline {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        background-color: var(--title-color);
        transition: width 300ms $intro-easing, left 300ms $intro-easing;
      }

      .tab {
        padding: 10px;
        cursor: pointer;
        text-transform: uppercase;

        &.selected {
          font-weight: bold;
        }
      }
    }
    .tab-content {
    }
  }
}
</style>
