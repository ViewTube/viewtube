<template>
  <div v-if="licenseText" v-create-links class="license links">
    {{ licenseText }}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch } from '@nuxtjs/composition-api';
import { useAxios } from '@/plugins/axios';

export default defineComponent({
  name: 'InvidiousLicense',
  setup() {
    const axios = useAxios();
    const licenseText = ref('');

    useFetch(async () => {
      await axios
        .get('https://raw.githubusercontent.com/iv-org/invidious/master/LICENSE')
        .then(response => {
          licenseText.value = response.data;
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
.license {
  width: 100%;
  margin: 0 !important;
}
</style>
