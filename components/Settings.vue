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
      <ThemeSelector />
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
    />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close'
import ThemeIcon from 'vue-material-design-icons/Brightness4'
import InstanceIcon from 'vue-material-design-icons/ServerNetwork'
import MiniplayerIcon from 'vue-material-design-icons/WindowRestore'
import ThemeSelector from '@/components/themes/ThemeSelector'
import SwitchButton from '@/components/buttons/SwitchButton'
import Dropdown from '@/components/filter/Dropdown'
import '@/assets/styles/popup.scss'

export default {
  name: 'Settings',
  components: {
    Dropdown,
    CloseIcon,
    ThemeIcon,
    InstanceIcon,
    MiniplayerIcon,
    SwitchButton,
    ThemeSelector
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
