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
import { computed, defineComponent, onMounted } from '@nuxtjs/composition-api';
import InstanceEntry from '@/components/list/InstanceEntry.vue';
import { useAccessor } from '@/store';

export default defineComponent({
  name: 'Instances',
  components: {
    CloseIcon,
    InstanceIcon,
    InstanceEntry
  },
  setup() {
    const accessor = useAccessor();

    const instances = computed(() => accessor.instances.instances);
    const currentInstance = computed(() => accessor.instances.currentInstance);

    const onInstanceChange = (element: any) => {
      accessor.instances.changeInstance(element.value);
    };

    onMounted(() => {
      const oneDay = 60 * 60 * 24 * 1000;
      let tooOld = false;
      if (accessor.instances.refreshDate) {
        const refreshDate = new Date(accessor.instances.refreshDate);
        tooOld = Date.now() - refreshDate.getTime() > oneDay;
      }
      if (accessor.instances.instances.length === 0 || tooOld) {
        accessor.instances.fetchInstances();
      }
    });

    return {
      instances,
      currentInstance,
      onInstanceChange
    };
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
}
</style>
