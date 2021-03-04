<template>
  <div>
    <GradientBackground :color="'theme'" />
    <div class="themeContainer">
      <h2 class="title foreground">Themes</h2>
      <h4 class="foreground"><i>Use the right-click menu to manage themes!</i></h4>
      <SectionTitle :title="'Default Themes'" />
      <DefaultThemeSelector
        class="foreground"
        :onManagePage="true"
        @contextOption="handleContextDefault"
      />
      <SectionTitle :title="'Custom Themes'">
        <div class="ButtonWrapper">
          <BadgeButton :click="() => (createThemeDialog = true)">
            <PlusIcon />
            <p>Create Theme</p>
          </BadgeButton>
        </div>
      </SectionTitle>
      <CustomThemeSelector
        class="foreground"
        :onManagePage="true"
        @contextOption="handleContextDefault"
      />
    </div>
    <portal to="popup">
      <CloneDialog v-if="cloneThemeDialog" @close="closeCloneDialog" @cloneTheme="cloneTheme" />
      <DeleteDialog
        v-if="deleteThemeDialog"
        @close="closeDeleteDialog"
        @deleteTheme="deleteTheme"
      />
    </portal>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import CustomThemeSelector from '@/components/themes/CustomThemeSelector.vue';
import DefaultThemeSelector from '@/components/themes/DefaultThemeSelector.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import CloneDialog from '@/components/themes/CloneDialog.vue';
import DeleteDialog from '@/components/themes/DeleteDialog.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import PlusIcon from 'vue-material-design-icons/Plus.vue';
import Axios from 'axios';
import { ThemeDto } from '@/plugins/shared';
import { commons } from '@/plugins/commons';
export default Vue.extend({
  components: {
    CustomThemeSelector,
    BadgeButton,
    DefaultThemeSelector,
    SectionTitle,
    PlusIcon,
    CloneDialog,
    DeleteDialog,
    GradientBackground
  },
  data() {
    return {
      cloneThemeDialog: false,
      deleteThemeDialog: false,
      createThemeDialog: false,
      activeContextTheme: {} as ThemeDto
    };
  },
  async fetch({ app: { $accessor } }) {
    if ($accessor.user.isLoggedIn) {
      await $accessor.theme.fetchCustomThemes();
    }
  },
  methods: {
    handleContextDefault(event: { option: string; theme: ThemeDto }) {
      this.activeContextTheme = {
        value: event.theme.value,
        themeVariables: event.theme.themeVariables,
        name: event.theme.name
      } as ThemeDto; // remove reference to store

      switch (event.option) {
        case 'clone':
          this.cloneThemeDialog = true;
          break;
        case 'delete':
          this.deleteThemeDialog = true;
          break;
        case 'deselect':
          this.$store.commit('theme/setCustomTheme', '');
          break;
      }
    },
    closeCloneDialog() {
      this.cloneThemeDialog = false;
    },
    cloneTheme(themeName: string) {
      Axios.post(
        `${this.$store.getters['environment/apiUrl']}user/theme`,
        {
          theme: {
            value: commons.uuidv4(),
            themeVariables: this.activeContextTheme.themeVariables,
            name: themeName
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
          this.closeCloneDialog();
        });
    },
    closeDeleteDialog() {
      this.deleteThemeDialog = false;
    },
    deleteTheme() {
      Axios.delete(
        `${this.$store.getters['environment/apiUrl']}user/theme/${this.activeContextTheme.value}`,
        {
          withCredentials: true
        }
      )
        .then(response => {
          if (response.data)
            this.$store.dispatch('messages/createMessage', {
              type: 'info',
              title: 'Deleting theme finished',
              message: 'Refreshing the page...'
            });
        })
        .catch(err => {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Deleting theme failed',
            message: err
          });
        })
        .finally(() => {
          this.$store.dispatch('theme/fetchCustomThemes');
          this.closeDeleteDialog();
        });
    }
  }
});
</script>
<style lang="scss" scoped>
.foreground {
  z-index: 10;
}
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
