<template>
  <div>
    <div class="themeManagerContainer">
      <SectionTitle :title="'Theme-Manager'">
        <BadgeButton class="badgeBtn" :click="() => (cloneModalOpen = true)">
          <CloneIcon />
          <p>Clone Theme</p>
        </BadgeButton>
      </SectionTitle>
      <div class="themes">
        <ThemePreview
          v-for="theme in this.$accessor.theme.allThemes"
          :key="theme.key"
          :theme="theme"
          :themeEditable="false"
        />
      </div>
      <portal to="popup">
        <transition v-if="cloneModalOpen" name="fade-down">
          <ThemeCloner :themes="themesArray" @close="closeCloneTheme" @clonedTheme="clonedTheme" />
        </transition>
      </portal>
    </div>
  </div>
</template>

<script>
import ThemePreview from '@/components/themes/ThemePreview';
import SectionTitle from '@/components/SectionTitle.vue';
import BadgeButton from '@/components/buttons/BadgeButton';
import ThemeCloner from '@/components/popup/ThemeCloner';
import CloneIcon from 'vue-material-design-icons/contentCopy';

export default {
  name: 'ThemeManager',
  components: { ThemePreview, SectionTitle, BadgeButton, CloneIcon, ThemeCloner },
  data: () => ({
    loading: true,
    cloneModalOpen: false
  }),
  computed: {
    themesArray() {
      const themesKeys = [];
      this.$accessor.theme.allThemes.forEach(element => {
        themesKeys.push({ key: element.key, name: element.name });
      });
      return themesKeys;
    }
  },
  methods: {
    editTheme(value) {},
    clonedTheme() {
      console.log('STOP');
      this.closeCloneTheme();
      this.$accessor.theme.resetThemes();
      this.$accessor.theme.fetchThemes();
    },
    closeCloneTheme() {
      this.cloneModalOpen = false;
    }
  },
  head() {
    return {
      title: `Theme Manager :: ViewTube`,
      meta: [] // TODO: find out what would be needed
    };
  }
};
</script>

<style lang="scss">
.themeManagerContainer {
  width: 100%;
  max-width: $main-width;
  margin: $header-height auto 0 auto;
}

.themes {
  display: flex;
  flex-direction: row;

  @media screen and (max-width: $mobile-width) {
    flex-direction: column;
  }
}
.badgeBtn {
  margin: auto !important;
}
</style>
