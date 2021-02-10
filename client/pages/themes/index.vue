<template>
  <div class="themeContainer">
    <h2 class="title"><ThemeIcon /> Default Themes</h2>
    <DefaultThemeSelector />
    <div class="manageThemesTitle">
      <h2 class="title"><CustomIcon /> Custom Themes</h2>
      <h3 class="manageThemesBtn">
        <BadgeButton :href="'themes/manage'" :internal-link="true">
          <EditIcon />
          <p>Manage</p>
        </BadgeButton>
      </h3>
    </div>

    <CustomThemeSelector />
  </div>
</template>
<script lang="ts">
// TODO: pagination (for extreme users with many themes)
import { ThemeDto } from '@/plugins/shared';
import CustomThemeSelector from '@/components/themes/CustomThemeSelector.vue';
import DefaultThemeSelector from '@/components/themes/DefaultThemeSelector.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import ThemeIcon from 'vue-material-design-icons/Brightness4.vue';
import CustomIcon from 'vue-material-design-icons/Tune.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import EditIcon from 'vue-material-design-icons/PencilBoxMultipleOutline.vue';
import Vue from 'vue';
export default Vue.extend({
  name: 'Themes',
  components: {
    CustomThemeSelector,
    DefaultThemeSelector,
    ThemeIcon,
    GradientBackground,
    CustomIcon,
    BadgeButton,
    EditIcon
  },
  data: () => ({
    themes: [] as ThemeDto[],
    loading: true
  }),
  async fetch({ app: app }) {
    await app.$accessor.theme.fetchCustomThemes();
  }
});
</script>
<style lang="scss" scoped>
.themeContainer {
  margin-top: $header-height;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  text-align: center;
  margin-top: 30px;
}
.manageThemesTitle {
  display: flex;
  justify-items: center;
}
.manageThemesBtn {
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  margin-left: 20px;
}
</style>
