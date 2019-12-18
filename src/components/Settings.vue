<template>
  <div class="settings">
    <div class="settings-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Settings</h1>
      <h2>Invidio.us instance</h2>
      <Dropdown :values="instances" :value="currentInstance" @valuechange="onInstanceChange" />
      <h2>Theme</h2>
      <Dropdown :values="themes" :value="currentTheme" @valuechange="onThemeChange" />
    </div>
    <div class="settings-overlay" @click.stop="$emit('close')"></div>
  </div>
</template>

<script>
import Dropdown from '@/components/filter/Dropdown'
import InstanceStore from '@/store/instances'
import CloseIcon from 'vue-material-design-icons/Close'
import SettingsStore from '@/store/settings'

export default {
  name: 'settings',
  components: {
    Dropdown,
    CloseIcon
  },
  data() {
    return {
      instances: InstanceStore.instances,
      currentInstance: InstanceStore.currentInstance,
      themes: SettingsStore.defaults.theme,
      currentTheme: SettingsStore.theme
    }
  },
  methods: {
    onInstanceChange(element, index) {
      InstanceStore.setInstance(element.value)
    },
    onThemeChange(element, index) {
      setTimeout(() => {
        document.body.classList.add('transition-all')
        SettingsStore.setTheme(element.value)
        setTimeout(() => {
          document.body.classList.remove('transition-all')
        }, 300)
      }, 300)
    }
  },
  mounted() {
    this.$Progress.finish()
  }
}
</script>

<style lang="scss">
.settings-overlay {
  position: fixed;
  background-color: var(--bgcolor-translucent);
  width: 100%;
  height: 100%;
  z-index: 8;
}

.settings {
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 8;
  position: fixed;

  .settings-container {
    width: 100%;
    z-index: 10;
    margin: auto;
    width: 100%;
    max-width: 500px;
    background-color: var(--bgcolor-alt);
    box-shadow: $medium-shadow;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    position: relative;
    padding: 20px;

    .close-icon {
      position: absolute;
      right: 0;
      top: 0;
      margin: 20px 20px 0 0;
      height: 38px;
      width: 38px;
      cursor: pointer;

      .material-design-icon__svg {
        height: 38px !important;
        width: 38px !important;
        position: unset !important;
      }
    }

    h1 {
      margin: 0 auto;
      font-size: 2rem;
      color: var(--theme-color);
      font-family: $default-font;
    }

    @media screen and (max-width: $mobile-width) {
      height: 100%;
      max-width: 100%;
      padding-top: $header-height;

      .close-icon {
        margin: 60px 20px 0 0;
      }
    }
  }
}
</style>
