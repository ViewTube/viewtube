<template>
  <div id="app" ref="appRef" class="layout">
    <ThemeStyling />
    <Header v-if="!headless" class="main-header" />
    <Miniplayer v-if="$store.getters.miniplayer" />
    <nuxt />
    <portal-target class="dropdown-portal" name="dropdown" multiple />
    <portal-target class="popup-portal" name="popup" multiple />
    <MessageBoxContainer />
  </div>
</template>

<script lang="ts">
import Header from '@/components/header/MainHeader.vue';
import Miniplayer from '@/components/miniplayer/Miniplayer.vue';
import MessageBoxContainer from '@/components/message/MessageBoxContainer.vue';
import ThemeStyling from '@/components/themes/ThemeStyling.vue';
import { computed, defineComponent, ref, useRoute } from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';

export default defineComponent({
  name: 'Default',
  components: {
    Header,
    Miniplayer,
    MessageBoxContainer,
    ThemeStyling
  },
  setup() {
    const route = useRoute();
    const accessor = useAccessor();

    const appRef = ref(null);

    const headless = computed((): boolean => {
      return route.value.meta.headless;
    });

    const getThemeClass = (): string => {
      if ((process as any).browser) {
        return `theme--${accessor.settings.theme}`;
      } else {
        return 'theme--default';
      }
    };

    if (accessor.instances.instances.length === 0) {
      accessor.instances.fetchInstances();
    }
    if (appRef.value) {
      appRef.value.classList.add(getThemeClass());
    }

    return {
      appRef,
      headless
    };
  }
});
</script>

<style lang="scss">
#app {
  font-family: 'noto-sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--title-color);
  background-color: var(--bgcolor-main);

  .dropdown-portal,
  .popup-portal {
    position: fixed;
    top: 0;
    height: 100vh;
    left: 0;
    right: 0;
    pointer-events: none;
    z-index: 901;

    > * {
      user-select: auto;
      pointer-events: auto;
    }
  }

  .dropdown-portal {
    z-index: 902;
  }

  .progress-bar-margin {
    top: $header-height - 3px !important;
  }

  .content {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
