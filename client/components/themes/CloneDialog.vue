<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Clone Theme</h1>
      <p>Please enter a name for the new theme</p>
      <form @submit.prevent="cloneTheme">
        <FormInput
          :id="'themename'"
          v-model="themeName"
          :label="'Name of new theme'"
          :type="'text'"
        />
        <SubmitButton class="submit" :label="'Clone Theme'" />
      </form>
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import FormInput from '@/components/form/FormInput.vue';
import SubmitButton from '@/components/form/SubmitButton.vue';
import '@/assets/styles/popup.scss';
import Vue from 'vue';
export default Vue.extend({
  name: 'CloneDialog',
  components: { CloseIcon, FormInput, SubmitButton },
  data() {
    return {
      themeName: ''
    };
  },
  methods: {
    cloneTheme() {
      this.$emit('cloneTheme', this.themeName);
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
