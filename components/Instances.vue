<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon
        class="close-icon"
        @click.stop="$emit('close')"
      />
      <h1>
        <InstanceIcon /> Invidious Instances
      </h1>
    </div>
    <div
      class="popup-overlay"
      @click.stop="$emit('close')"
    />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close'
import InstanceIcon from 'vue-material-design-icons/ServerNetwork'
import '@/assets/styles/popup.scss'

export default {
  name: 'Instances',
  components: {
    CloseIcon,
    InstanceIcon
  },
  data() {
    return {
      instances: this.$store.getters['instances/instances'],
      currentInstance: this.$store.getters['instances/currentInstance']
    }
  },
  methods: {
    onInstanceChange(element, index) {
      this.$store.commit('instances/changeInstance', element.value)
    }
  }
}

</script>

<style lang="scss">

</style>
