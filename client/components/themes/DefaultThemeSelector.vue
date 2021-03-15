<template>
  <div class="theme-selector">
    <ThemePreview
      v-for="(theme, index) in this.$store.getters['theme/defaultThemes']"
      :key="index"
      :theme="theme"
      class="theme"
      :style="{
        'border-color': getBorderThemeColor(theme)
      }"
      @themeclick="onThemeChange"
      @onContextClick="onContextClick"
    />
    <vue-simple-context-menu
      :ref="'vueSimpleContextMenu'"
      :elementId="'defaultContextMenu'"
      :options="contextOptions"
      @option-clicked="optionClicked"
    />
  </div>
</template>

<script lang="ts">
import { ThemeDto } from '@/plugins/shared';
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css';
import VueSimpleContextMenu from 'vue-simple-context-menu';
import ThemePreview from '@/components/themes/ThemePreview.vue';
import Vue from 'vue';

export default Vue.extend({
  components: { VueSimpleContextMenu, ThemePreview },
  props: {
    onManagePage: Boolean
  },
  computed: {
    contextOptions() {
      if (this.onManagePage) {
        return [{ name: 'Clone Theme', slug: 'clone' }];
      }
      return [];
    }
  },
  methods: {
    onThemeChange(theme: ThemeDto) {
      document.body.classList.add('transition-all');
      this.$store.commit('theme/setDefaultTheme', theme.value);
      setTimeout(() => {
        document.body.classList.remove('transition-all');
      }, 300);
    },
    onContextClick(event, theme: ThemeDto) {
      this.$refs.vueSimpleContextMenu.showMenu(event, theme);
    },
    optionClicked(event) {
      this.$emit('contextOption', {
        option: event.option.slug,
        theme: event.item as ThemeDto
      });
    },
    getBorderThemeColor(theme: ThemeDto): string {
      return theme.value === this.$store.getters['theme/selectedDefault']
        ? theme.themeVariables['theme-color']
        : this.$store.getters['theme/themeVariables'].themeVariables['bgcolor-alt-light'];
    }
  }
});
</script>
<style lang="scss">
.vue-simple-context-menu__item {
  background-color: var(--bgcolor-alt);
  color: var(--theme-color);
}
.vue-simple-context-menu__item:hover {
  background-color: var(--bgcolor-alt-light);
  color: var(--theme-color);
}

.vue-simple-context-menu li:first-of-type {
  margin-top: 0;
}

.vue-simple-context-menu li:last-of-type {
  margin-bottom: 0;
}
</style>
<style lang="scss" scoped>
.theme-selector {
  width: calc(100% - 56px);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 20px 0 0 0;
  justify-content: space-evenly;
}
.theme {
  border-style: solid;
  border-width: 2px;
  border-radius: 4px;
  border-color: var(--theme-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  transition: box-shadow 200ms $intro-easing, border-color 200ms $intro-easing;
  margin: 5px;
}

.theme::after {
  display: none;
}
</style>
