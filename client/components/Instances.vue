<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon
        class="close-icon"
        @click.stop="$emit('close')"
      />
      <h1><InstanceIcon />Invidious Instances</h1>
      <table class="instances-table">
        <thead>
          <tr>
            <th>URL</th>
            <th>Health</th>
          </tr>
        </thead>
        <tbody>
          <InstanceEntry
            v-for="instance in instances"
            :key="instance.url"
            :instance="instance"
          />
        </tbody>
      </table>
    </div>
    <div
      class="popup-overlay"
      @click.stop="$emit('close')"
    />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import InstanceIcon from 'vue-material-design-icons/ServerNetwork';
import '@/assets/styles/popup.scss';
import InstanceEntry from '@/components/list/InstanceEntry';

export default {
  name: 'Instances',
  components: {
    CloseIcon,
    InstanceIcon,
    InstanceEntry
  },
  data() {
    return {
      instances: this.$store.getters['instances/instances'],
      currentInstance: this.$store.getters[
        'instances/currentInstance'
      ]
    };
  },
  methods: {
    onInstanceChange(element, index) {
      this.$store.commit(
        'instances/changeInstance',
        element.value
      );
    }
  }
};
</script>

<style lang="scss">
.instances-table {
  width: 100%;
}
.instances-table th {
  text-align: start;
}
.instances-table td {
  padding-right: 2vw;
}
</style>
