<template>
  <div class="themeManagerContainer">
    <SectionTitle :title="'Theme-Manager'">
      <BadgeButton class="cloneThemeButton" :click="() => (cloneModalOpen = true)">
        <ImportIcon />
        <p>Import subscriptions</p>
      </BadgeButton>
    </SectionTitle>
    <div class="defaultThemesRow">
      <ThemePreview
        v-for="theme in defaultThemes"
        :key="theme.value"
        :theme="theme"
        :themeEditable="true"
        @editTheme.stop="editTheme($event)"
      />
    </div>
    <!-- <ThemePreview v-for="theme in themes" :key="theme.value" :theme="theme" /> -->
    <portal to="popup">
      <transition name="fade-down">
        <ThemeCloner v-if="cloneModalOpen" @close="closeCloneTheme" />
      </transition>
    </portal>
  </div>
</template>

<script>
import ThemePreview from '@/components/themes/ThemePreview';
import SectionTitle from '@/components/SectionTitle.vue';
import BadgeButton from '@/components/buttons/BadgeButton';
import ThemeCloner from '@/components/popup/ThemeCloner';
export default {
  name: 'ThemeManager',
  components: { ThemePreview, SectionTitle, BadgeButton },
  async fetch() {
    await this.$axios
      .get(`${this.$store.getters['environment/apiUrl']}user/themes`, {
        withCredentials: true
      })
      .then(response => {
        this.themes = response.data;
        this.loading = false;
      })
      .catch(error => {
        console.log(error);
      });
  },
  data: () => ({
    themes: [],
    defaultThemes: [],
    loading: true,
    cloneModalOpen: false
  }),
  computed: {
    userAuthenticated() {
      return this.$store.getters['user/isLoggedIn'];
    }
  },
  mounted() {
    this.defaultThemes = this.$store.getters['theme/defaultThemes'];
  },
  methods: {
    editTheme(value) {},
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
  margin: $header-height 0 0 10px;
  width: 100%;
}
.defaultThemesRow {
  display: flex;
  flex-direction: row;

  @media screen and (max-width: $mobile-width) {
    flex-direction: column;
  }
}
.section-title {
  .title {
    margin: 0 0 0 15px;
  }
}
</style>
