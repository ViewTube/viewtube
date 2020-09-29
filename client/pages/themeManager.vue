<template>
  <div>
    <div class="themeManagerContainer">
      <SectionTitle :title="'Theme-Manager'">
        <BadgeButton class="badgeBtn" :click="() => (cloneModalOpen = true)">
          <CloneIcon />
          <p>Import subscriptions</p>
        </BadgeButton>
      </SectionTitle>
      <div class="themes">
        <ThemePreview
          v-for="theme in defaultThemes"
          :key="theme.value"
          :theme="theme"
          :themeEditable="true"
          @editTheme.stop="editTheme($event)"
        />
        <!-- <ThemePreview v-for="theme in themes" :key="theme.value" :theme="theme" /> -->
      </div>
      <portal to="popup">
        <transition v-if="cloneModalOpen" name="fade-down">
          <ThemeCloner :themes="themesKeyArray" @close="closeCloneTheme" />
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
    },
    themesKeyArray() {
      const themesKeys = [];
      this.themes.forEach(element => {
        themesKeys.push(element.value);
      });
      this.defaultThemes.forEach(element => {
        themesKeys.push(element.value);
      });
      return themesKeys;
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
