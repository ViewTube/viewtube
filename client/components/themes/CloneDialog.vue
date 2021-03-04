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
import Axios from 'axios';
import { ThemeDto } from '@/plugins/shared';
import { commons } from '@/plugins/commons';
import '@/assets/styles/popup.scss';
import Vue from 'vue';
export default Vue.extend({
  name: 'CloneDialog',
  components: { CloseIcon, FormInput, SubmitButton },
  props: {
    theme: ThemeDto
  },
  data() {
    return {
      themeName: ''
    };
  },
  methods: {
    cloneTheme() {
      Axios.post(
        `${this.$store.getters['environment/apiUrl']}user/theme`,
        {
          theme: {
            value: commons.uuidv4(),
            themeVariables: this.theme.themeVariables,
            name: this.themeName
          } as ThemeDto
        },
        { withCredentials: true }
      )
        .then(response => {
          if (response.data)
            this.$store.dispatch('messages/createMessage', {
              type: 'info',
              title: 'Cloning theme finished',
              message: 'Refreshing the page...'
            });
        })
        .catch(err => {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Cloning theme failed',
            message: err
          });
        })
        .finally(() => {
          this.$store.dispatch('theme/fetchCustomThemes');
          this.$emit('close');
        });
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
