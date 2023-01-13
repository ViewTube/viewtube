<template>
  <div class="license-container">
    <pre v-if="licenseText" v-create-links class="license links" v-text="licenseText" />
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: 'InvidiousLicense',
  setup() {
    const { data: licenseTextData } = useGetInvidiousLicense();

    const licenseText = computed(() =>
      licenseTextData.value?.replaceAll('<', '').replaceAll('>', '')
    );

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
