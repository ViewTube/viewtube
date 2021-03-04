<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Delete Theme</h1>
      <p>
        Are you sure you want to delete the theme <b>{{ themeName }}</b>
      </p>
      <form @submit.prevent="deleteTheme">
        <SubmitButton class="submit" :label="'Delete Theme'" />
      </form>
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import SubmitButton from '@/components/form/SubmitButton.vue';
import '@/assets/styles/popup.scss';
import Vue from 'vue';
export default Vue.extend({
  name: 'CloneDialog',
  components: { CloseIcon, SubmitButton },
  props: {
    themeName: String
  },
  methods: {
    deleteTheme() {
      this.$emit('deleteTheme');
    }
  }
});
</script>

<style lang="scss" scoped>
form {
  width: 100%;
}
.submit {
  width: 100%;
  margin-top: 10px;
}
</style>
