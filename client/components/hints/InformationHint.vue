<template>
  <div class="information-hint"><slot /><InformationIcon /></div>
</template>

<script lang="ts">
import InformationIcon from 'vue-material-design-icons/Information.vue';
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'InformationHint',
  components: {
    InformationIcon
  }
});
</script>

<style lang="scss">
.information-hint {
  border: 2px solid #4caf4f5e;
  background-color: #4caf4f1e;
  padding: 8px;
  display: flex;
  border-radius: 5px;
  justify-content: space-between;

  .material-design-icon {
    justify-self: flex-end;
    padding: 0 10px 0 0;
  }
}
</style>
