<template>
  <div>
    <div class="themeContainer">
      <h2 class="title">Themes</h2>
      <h4><i>Use the right-click menu to manage themes!</i></h4>
      <SectionTitle :title="'Default Themes'" />
      <DefaultThemeSelector :onManagePage="true" @contextOption="handleContextDefault" />
      <SectionTitle :title="'Custom Themes'">
        <div class="ButtonWrapper">
          <BadgeButton :click="() => (createTheme = true)">
            <PlusIcon />
            <p>Create Theme</p>
          </BadgeButton>
        </div>
      </SectionTitle>
      <CustomThemeSelector :onManagePage="true" />
    </div>
    <portal to="popup">
      <p v-if="cloneThemeDialog">lul funkt</p>
    </portal>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import CustomThemeSelector from '@/components/themes/CustomThemeSelector.vue';
import DefaultThemeSelector from '@/components/themes/DefaultThemeSelector.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import PlusIcon from 'vue-material-design-icons/Plus.vue';
import Axios from 'axios';
import { ThemeDto } from '@/plugins/shared';
export default Vue.extend({
  components: {
    CustomThemeSelector,
    BadgeButton,
    DefaultThemeSelector,
    SectionTitle,
    PlusIcon
  },
  data() {
    return {
      cloneThemeDialog: true
    };
  },
  async fetch({ app: { $accessor } }) {
    if ($accessor.user.isLoggedIn) {
      await $accessor.theme.fetchCustomThemes();
    }
  },
  methods: {
    handleContextDefault(event: { option: string; theme: ThemeDto }) {
      if (event.option === 'clone') {
        Axios.post(
          `${this.$store.getters['environment/apiUrl']}user/theme`,
          { theme: event.theme },
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
          .finally(this.$store.dispatch('theme/fetchCustomThemes'));
      }
    }
  }
});
</script>
<style lang="scss" scoped>
.themeContainer {
  margin-top: $header-height;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 10px;
}
.actions {
  display: flex;
  flex-direction: row;
}
.title {
  text-align: center;
  margin-top: 30px;
}
.ButtonWrapper {
  display: flex;
  align-items: center;
  margin-right: 10px;
}
</style>
