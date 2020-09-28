<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Themes</h1>
      <nuxt-link
        v-show="userAuthenticated"
        id="themeManager"
        v-ripple
        v-tippy="'Manage your themes'"
        to="/themeManager"
        class="tooltip btn"
        @click.stop="$emit('close')"
        ><ThemeManagerIcon />Manage</nuxt-link
      >
      <div class="themes-container">
        <ThemePreview v-for="theme in themes" :key="theme.value" :theme="theme" />
      </div>
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import ThemePreview from '@/components/themes/ThemePreview';
import ThemeManagerIcon from 'vue-material-design-icons/OpenInNew';
import '@/assets/styles/popup.scss';

export default {
  name: 'Themes',
  components: {
    CloseIcon,
    ThemePreview,
    ThemeManagerIcon
  },
  data() {
    return {
      themes: this.$store.getters['theme/themes'],
      currentTheme: this.$store.getters['theme/theme']
    };
  },
  computed: {
    userAuthenticated() {
      return this.$store.getters['user/isLoggedIn'];
    }
  },
  methods: {
    onThemeChange(element, index) {
      setTimeout(() => {
        document.body.classList.add('transition-all');
        this.$store.commit('theme/setTheme', element.value);
        setTimeout(() => {
          document.body.classList.remove('transition-all');
        }, 300);
      }, 300);
    }
  }
};
</script>

<style lang="scss">
.btn {
  margin: auto;
  display: flex;
  flex-direction: row;
  justify-items: center;

  svg {
    width: 28px;
    height: 28px;
  }
  text-decoration: none;
  color: var(--theme-color);
  transition: color 300ms $intro-easing;
  margin: 0 5px;
  user-select: none;
  border-radius: 5px;
  line-height: 100%;
  text-align: center;
  padding: 5px 10px;
  box-sizing: border-box;
  border: solid 2px transparent;
}

.themes-container {
  padding-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  margin: 0 !important;
}
</style>
