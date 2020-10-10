<template>
  <div class="settings popup">
    <div class="settings-container popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Settings</h1>
      <h2><MiniplayerIcon />Miniplayer</h2>
      <SwitchButton
        :value="$store.getters['settings/miniplayer']"
        :label="'Enable miniplayer'"
        @valuechange="val => $store.commit('settings/setMiniplayer', val)"
      />
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import MiniplayerIcon from 'vue-material-design-icons/WindowRestore';
import SwitchButton from '@/components/buttons/SwitchButton';
import '@/assets/styles/popup.scss';

export default {
  name: 'Settings',
  components: {
    CloseIcon,
    MiniplayerIcon,
    SwitchButton
  },
  methods: {}
};
</script>

<style lang="scss"></style>
