<template>
  <div class="popup">
    <div class="popup-container">
      <div class="themeCloner">
        <CloseIcon class="close-icon" @click.stop="$emit('close')" />
        <h1>Clone Theme</h1>
        <form id="login" method="post" @submit.prevent="copyTheme">
          <label for="parentThemeDropdown">Parent Theme</label>
          <Dropdown
            id="parentThemeDropdown"
            placeholder="Choose a Parent Theme"
            :options="themes"
            :value="selectedElement"
            label="name"
            aria-required="true"
            @input="valueChange"
          />
          <FormInput :id="'newThemeName'" v-model="newThemeName" :label="'Name for new Theme'" />
          <SubmitButton />
        </form>
      </div>
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import Dropdown from '@/components/form/Dropdown';
import FormInput from '@/components/form/FormInput';
import SubmitButton from '@/components/form/SubmitButton';
import '@/assets/styles/popup.scss';
import _ from 'lodash';

export default {
  name: 'ThemeCloner',
  components: {
    CloseIcon,
    Dropdown,
    FormInput,
    SubmitButton
  },
  props: {
    themes: Array
  },
  data: () => ({
    selectedElement: Object,
    newThemeName: String
  }),
  mounted() {
    this.selectedElement = this.themes[0];
    this.newThemeName = '';
  },
  methods: {
    valueChange(element) {
      this.selectedElement = element;
    },
    copyTheme() {
      const themes = this.$accessor.theme.themes;
      const copiedTheme = _.cloneDeep(themes.find(el => this.selectedElement.key === el.key));
      copiedTheme.key = this.newThemeName.replace(/\s+/g, '-').toLowerCase();
      copiedTheme.name = this.newThemeName;
      copiedTheme.default = false;
      copiedTheme.username = this.$accessor.user.username;
      this.$axios
        .post(`${this.$accessor.environment.apiUrl}user/themes`, copiedTheme, {
          withCredentials: true
        })
        .then(() => {
          this.$accessor.messages.createMessage({
            type: 'info',
            title: 'Theme cloning succeeded',
            message: 'Reloading Themes...'
          });
          this.$emit('clonedTheme');
        })
        .catch(error => {
          this.$accessor.messages.createMessage({
            type: 'error',
            title: 'Theme cloning failed',
            message: error.message
          });
        });
    }
  }
};
</script>

<style lang="scss">
.themeCloner {
  margin: 15px 20px;
  width: calc(100% -40px);
}
.form-input {
  margin: 10px 0;
}
</style>
