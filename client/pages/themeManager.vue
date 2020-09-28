<template>
  <div class="themeManagerContainer">
    <SectionTitle :title="'Theme-Manager'" />
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
  </div>
</template>

<script>
import ThemePreview from '@/components/themes/ThemePreview';
import SectionTitle from '@/components/SectionTitle.vue';
export default {
  name: 'ThemeManager',
  components: { ThemePreview, SectionTitle },
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
    loading: true
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
    editTheme(value) {}
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
