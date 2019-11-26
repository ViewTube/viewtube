<template>
  <div class="settings" @scroll="$emit('scroll', $event)">
    <div class="settings-container">
      <vue-headful title="Settings - ViewTube" />
      <h1>Settings</h1>
      <h2>Invidio.us instance</h2>
      <Dropdown :values="instances" :value="currentInstance" @valuechange="onInstanceChange" />
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
      instances: InstanceStore.instances,
      currentInstance: InstanceStore.currentInstance
    }
  },
  methods: {
    onInstanceChange(element, index) {
      InstanceStore.setInstance(element.value)
      console.log(InstanceStore.currentInstance)
    }
  },
  mounted() {
    this.$Progress.finish()
    console.log(InstanceStore.currentInstance)
  }
}
</script>

<style lang="scss">
.settings {
  margin-top: $header-height;
  width: 100%;
  height: 100%;
  display: flex;

  .settings-container {
    width: 100%;
    z-index: 10;
    margin: auto;
    width: 100%;
    max-width: 500px;
    background-color: $bgcolor-alt;
    box-shadow: $medium-shadow;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: flex-start;
    position: relative;
    padding: 20px;

    h1 {
      margin: 0 auto;
      font-size: 2rem;
      color: $theme-color;
      font-family: $default-font;
    }

    @media screen and (max-width: $mobile-width) {
      height: 100%;
    }
  }
}
</style>
