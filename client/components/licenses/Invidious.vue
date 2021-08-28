<template>
  <div class="license-container">
    <pre v-if="licenseText" v-create-links class="license links" v-text="licenseText" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch } from '@nuxtjs/composition-api';
import { useAxios } from '@/plugins/axiosPlugin';
import { useAccessor } from '@/store';

export default defineComponent({
  name: 'InvidiousLicense',
  setup() {
    const axios = useAxios();
    const accessor = useAccessor();
    const licenseText = ref('');

    useFetch(async () => {
      await axios
        .get(
          `${accessor.environment.textProxyUrl}https://raw.githubusercontent.com/iv-org/invidious/master/LICENSE`
        )
        .then(response => {
          licenseText.value = (response.data as string).replaceAll('<', '').replaceAll('>', '');
        })
        .catch(_ => {});
    });

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
