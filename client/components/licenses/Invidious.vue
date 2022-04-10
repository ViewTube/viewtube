<template>
  <div class="license-container">
    <pre v-if="licenseText" v-create-links class="license links" v-text="licenseText" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '#imports';
import { useAccessor } from '@/hooks/accessor';

export default defineComponent({
  name: 'InvidiousLicense',
  setup() {
    const accessor = useAccessor();
    const { data: licenseTextData, ...a } = useLazyFetch(
      `${accessor.environment.textProxyUrl}https://raw.githubusercontent.com/iv-org/invidious/master/LICENSE`
    );

    console.log(a);

    const licenseText = computed(() => licenseTextData.replaceAll('<', '').replaceAll('>', ''));

    return {
      licenseText
    };
  }
});
</script>

<style lang="scss" scoped>
.license-container {
  margin: 0 !important;
  padding: 0 0 100px 0;

  .license {
    background-color: var(--bgcolor-main);
    margin: 0 auto !important;
    white-space: pre-wrap;
    font-size: 1rem;
  }
}
</style>
