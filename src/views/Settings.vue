<template>
  <div class="settings" @scroll="$emit('scroll', $event)">
    <div class="settings-container">
      <vue-headful title="Settings - ViewTube" />
      <h1>Settings</h1>
      <h2>Invidio.us instance</h2>
      <Dropdown :values="instances" @valuechange="onInstanceChange" />
    </div>
  </div>
</template>

<script>
import Dropdown from '@/components/filter/Dropdown'
import InstanceStore from '@/store/instances'

export default {
  name: 'settings',
  components: {
    Dropdown
  },
  data() {
    return {
      instances: InstanceStore.instances
    }
  },
  methods: {
    onInstanceChange(element, index) {
      InstanceStore.setInstance(element.value)
    }
  },
  mounted() {
    this.$Progress.finish()
  }
}
</script>

<style lang="scss">
.settings {
  margin-top: $header-height;
  display: flex;

  .settings-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
  }
}
</style>
