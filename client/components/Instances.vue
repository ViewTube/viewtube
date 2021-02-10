<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1><InstanceIcon />Invidious Instances</h1>
      <table class="instances-table">
        <thead>
          <tr>
            <th>Selected</th>
            <th>URL</th>
            <!-- <th class="right-header">Health</th> -->
          </tr>
        </thead>
        <tbody>
          <InstanceEntry v-for="instance in instances" :key="instance.url" :instance="instance" />
        </tbody>
      </table>
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import InstanceIcon from 'vue-material-design-icons/ServerNetwork.vue';
import '@/assets/styles/popup.scss';
import InstanceEntry from '@/components/list/InstanceEntry.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'Instances',
  components: {
    CloseIcon,
    InstanceIcon,
    InstanceEntry
  },
  data() {
    return {
      instances: this.$store.getters['instances/instances'],
      currentInstance: this.$store.getters['instances/currentInstance']
    };
  },
  methods: {
    onInstanceChange(element: any) {
      this.$store.commit('instances/changeInstance', element.value);
    }
  }
});
</script>

<style lang="scss">
.instances-table {
  width: 100%;
  th {
    text-align: start;
  }
  .right-header {
    text-align: right;
  }

  td {
    // padding-right: 2vw;
  }
}
</style>
