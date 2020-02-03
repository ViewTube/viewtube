<template>
  <div class="tab-menu">
    <div class="tab-menu-inner">
      <div class="tabs">
        <div
          class="tab"
          v-for="(tabName, id) in tabNames"
          :key="`tab-${id}`"
          @click="(e) => onTabSelected(id, e)"
          :class="{ selected: selectedTab === id }"
          :ref="`tab-${id}`"
        >{{ tabName }}</div>
        <span
          class="tab-underline"
          :style="{ width: `${tabUnderlineWidth}px`, left: `${tabUnderlineLeft}px` }"
        ></span>
      </div>
      <div class="tab-content" v-for="(tabName, id) in tabNames" :key="`tab-content-${id}`">
        <div class="tab-content-inner" v-if="selectedTab === id">
          <slot :name="tabName"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tab-menu',
  data: () => ({
    selectedTab: 0,
    tabUnderlineWidth: 0,
    tabUnderlineLeft: 0
  }),
  props: {
    tabNames: {
      type: Array,
      required: true
    }
  },
  mounted() {
    if (this.$route.query.tab) {
      this.selectedTab = this.tabNames.findIndex((el, id) => id === this.$route.query.tab)
    }
  },
  methods: {
    onTabSelected(tabId, e) {
      this.tabUnderlineWidth = e.target.clientWidth
      this.tabUnderlineLeft = e.target.offsetLeft

      this.selectedTab = tabId
    }
  }
}
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
