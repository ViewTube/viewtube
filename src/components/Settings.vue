<template>
  <div class="settings popup">
    <div class="settings-container popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Settings</h1>
      <h2>
        <InstanceIcon />Invidio.us instance
      </h2>
      <Dropdown :values="instances" :value="currentInstance" @valuechange="onInstanceChange" />
      <h2>
        <ThemeIcon />Theme
      </h2>
      <Dropdown :values="themes" :value="currentTheme" @valuechange="onThemeChange" />
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="$emit('close')"></div>
  </div>
</template>

<script>
import Dropdown from '@/components/filter/Dropdown'
import InstanceStore from '@/store/instances'
import CloseIcon from 'icons/Close'
import SettingsStore from '@/store/settings'
import ThemeIcon from 'icons/Brightness4'
import InstanceIcon from 'icons/ServerNetwork'
import '@/styles/popup.scss'

export default {
  name: 'settings',
  components: {
    Dropdown,
    CloseIcon,
    ThemeIcon,
    InstanceIcon
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
  }
}
</script>

<style lang="scss">
</style>
