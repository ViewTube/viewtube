<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Theme Editor</h1>
      <form v-if="theme" @submit.prevent="submitTheme">
        <FormInput
          :id="'bgcolor-main'"
          v-model="theme.themeVariables['bgcolor-main']"
          :label="'Name of theme'"
          :type="'text'"
        />
        <ChromePicker :value="themeProp.themeVariables['bgcolor-main']" />
        <FormInput :id="'themename'" v-model="theme.name" :label="'Name of theme'" :type="'text'" />
        <SubmitButton v-if="theme" class="submit" :label="'Save Theme'" />
        <SubmitButton v-if="!theme" class="submit" :label="'Create Theme'" />
      </form>
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import SubmitButton from '@/components/form/SubmitButton.vue';
import FormInput from '@/components/form/FormInput.vue';
import { Chrome } from 'vue-color';
import '@/assets/styles/popup.scss';
import Vue from 'vue';
import { ThemeDto } from '@/plugins/shared';
export default Vue.extend({
  name: 'ThemeEditor',
  components: { CloseIcon, SubmitButton, FormInput, ChromePicker: Chrome },
  props: {
    themeProp: Object
  },
  data() {
    return {
      theme: { value: '', name: '', themeVariables: {} } as ThemeDto,
      colors: ''
    };
  },
  mounted() {
    this.theme = this.themeProp;
  },
  methods: {
    submitTheme() {}
  }
});
</script>

<style lang="sass"></style>
