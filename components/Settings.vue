<template>
  <div class="settings popup">
    <div class="settings-container popup-container">
      <CloseIcon
        class="close-icon"
        @click.stop="$emit('close')"
      />
      <h1>Settings</h1>
      <h2>
        <InstanceIcon />Invidio.us instance
      </h2>
      <Dropdown
        :values="instances"
        :value="currentInstance"
        @valuechange="onInstanceChange"
      />
      <h2>
        <ThemeIcon />Theme
      </h2>
      <Dropdown
        :values="themes"
        :value="currentTheme"
        @valuechange="onThemeChange"
      />
      <h2>
        <MiniplayerIcon />Miniplayer
      </h2>
      <SwitchButton
        :value="$store.getters['settings/miniplayer']"
        :label="'Enable miniplayer'"
        @valuechange="val => $store.commit('settings/setMiniplayer', val)"
      />
    </div>
    <div
      class="settings-overlay popup-overlay"
      @click.stop="$emit('close')"
    ></div>
  </div>
</template>

<script>
import Dropdown from '@/components/filter/Dropdown'
import SwitchButton from '@/components/buttons/SwitchButton'
import CloseIcon from 'vue-material-design-icons/Close'
import ThemeIcon from 'vue-material-design-icons/Brightness4'
import InstanceIcon from 'vue-material-design-icons/ServerNetwork'
import MiniplayerIcon from 'vue-material-design-icons/WindowRestore'
import '@/assets/styles/popup.scss'

export default {
  name: 'settings',
  components: {
    Dropdown,
    CloseIcon,
    ThemeIcon,
    InstanceIcon,
    MiniplayerIcon,
    SwitchButton
  },
  data() {
    return {
      instances: this.$store.getters['instances/instances'],
      currentInstance: this.$store.getters['instances/currentInstance'],
      themes: this.$store.getters['settings/defaultThemes'],
      currentTheme: this.$store.getters['settings/theme']
    }
  },
  methods: {
    onInstanceChange(element, index) {
      this.$store.commit('instances/changeInstance', element.value)
    },
    onThemeChange(element, index) {
      setTimeout(() => {
        document.body.classList.add('transition-all')
        this.$store.commit('settings/setTheme', element.value)
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
