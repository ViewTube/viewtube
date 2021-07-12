<template>
  <div v-if="licenseText" v-create-links class="license links">
    {{ licenseText }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'InvidiousLicense',
  data() {
    return {
      licenseText: null
    };
  },
  mounted() {
    this.$axios
      .get('https://raw.githubusercontent.com/iv-org/invidious/master/LICENSE')
      .then(response => {
        this.licenseText = response.data;
      })
      .catch(_ => {});
  }
});
</script>

<style lang="scss" scoped>
.license {
  width: 100%;
  margin: 0 !important;
}
</style>
