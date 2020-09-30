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
            :value="themes[0]"
            label="name"
            aria-required="true"
            @input="keyChange"
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
    selectedTheme: String,
    newThemeName: String
  }),
  mounted() {
    this.selectedTheme = this.themes[0].key;
    this.newThemeName = '';
  },
  methods: {
    keyChange(element) {
      this.selectedTheme = element.key;
    },
    copyTheme() {
      const data = this.$store.getters['theme/themes'];
      const themeUnconverted = data.find(el => this.selectedTheme === el.value);
      const themeTemplate = {};
      themeUnconverted.forEach(row => {
        switch (row[0]) {
          case 'key':
          case 'name':
            themeTemplate[row[0]] = row[1];
            break;
          case 'default':
            break;
          default:
            themeTemplate.variable[row[0]] = row[1];
        }
      });
      // TODO: remove
      console.log(themeTemplate);
      this.$axios
        .post(
          `${this.$store.getters['environment/apiUrl']}user/themes`,
          {
            theme: themeTemplate
          },
          {
            withCredentials: true
          }
        )
        .then(console.log)
        .catch(console.log);
      // if  {
      // } else {
      //   this.$store.dispatch('messages/createMessage', {
      //     type: 'error',
      //     title: 'Theme cloning failed',
      //     message: ''
      //   });
      // }
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
