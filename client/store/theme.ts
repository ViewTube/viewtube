import { ThemeDto } from '@/plugins/shared';
import { actionTree, getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  selectedDefault: 'default' as string,
  selectedCustom: '' as string,
  defaults: [
    {
      value: 'default',
      name: 'Dark theme',
      themeVariables: {
        'bgcolor-main': '#121212',
        'bgcolor-alt': '#1a1a1a',
        'bgcolor-alt-light': '#484848',
        'bgcolor-translucent': '#0000007c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#ff7b3a',
        'theme-color-light': '#f5af19',
        'theme-color-dark': '#f12711',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#ff7b3a80',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
              53deg,
              rgba(241, 87, 10, 1) 0%,
              rgba(224, 140, 112, 1) 33%,
              rgba(89, 193, 186, 1) 78%,
              rgba(0, 212, 255, 1) 100%
            )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#272727',
        'header-transparent': '#00000000',
        'title-color': '#ebebeb',
        'subtitle-color': '#d8d8d8',
        'subtitle-color-light': '#b3b3b3',
        darkness: 'invert(90%)',
        'gradient-opacity': 1
      }
    },
    {
      value: 'light',
      name: 'Light theme',
      themeVariables: {
        'bgcolor-main': '#ffffff',
        'bgcolor-alt': '#ffffff',
        'bgcolor-alt-light': '#dadada',
        'bgcolor-translucent': '#ffffff7c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#ff7b3a',
        'theme-color-light': '#f5af19',
        'theme-color-dark': '#f12711',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#ff7b3a80',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
              53deg,
              rgba(241, 87, 10, 1) 0%,
              rgba(224, 140, 112, 1) 33%,
              rgba(89, 193, 186, 1) 78%,
              rgba(0, 212, 255, 1) 100%
            )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#ffffff',
        'header-transparent': '#ffffff',
        'title-color': '#080808',
        'subtitle-color': '#333333',
        'subtitle-color-light': '#4e4e4e',
        darkness: 'invert(0%)',
        'gradient-opacity': 0
      }
    },
    {
      value: 'dark-no-gradient',
      name: 'Dark theme without background gradients',
      themeVariables: {
        'bgcolor-main': '#121212',
        'bgcolor-alt': '#1a1a1a',
        'bgcolor-alt-light': '#484848',
        'bgcolor-translucent': '#0000007c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#ff7b3a',
        'theme-color-light': '#f5af19',
        'theme-color-dark': '#f12711',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#ff7b3a80',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
            53deg,
            rgba(241, 87, 10, 1) 0%,
            rgba(224, 140, 112, 1) 33%,
            rgba(89, 193, 186, 1) 78%,
            rgba(0, 212, 255, 1) 100%
          )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#272727',
        'header-transparent': '#00000000',
        'title-color': '#ebebeb',
        'subtitle-color': '#d8d8d8',
        'subtitle-color-light': '#b3b3b3',
        darkness: 'invert(90%)',
        'gradient-opacity': 0
      }
    },
    {
      value: 'black',
      name: 'Black theme',
      themeVariables: {
        'bgcolor-main': '#000000',
        'bgcolor-alt': '#1a1a1a',
        'bgcolor-alt-light': '#484848',
        'bgcolor-translucent': '#0000007c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#ff7b3a',
        'theme-color-light': '#f5af19',
        'theme-color-dark': '#f12711',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#ff7b3a80',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
            53deg,
            rgba(241, 87, 10, 1) 0%,
            rgba(224, 140, 112, 1) 33%,
            rgba(89, 193, 186, 1) 78%,
            rgba(0, 212, 255, 1) 100%
          )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#272727',
        'header-transparent': '#00000000',
        'title-color': '#ebebeb',
        'subtitle-color': '#d8d8d8',
        'subtitle-color-light': '#b3b3b3',
        darkness: 'invert(100%)',
        'gradient-opacity': 1
      }
    },
    {
      value: 'green',
      name: 'Dark green theme',
      themeVariables: {
        'bgcolor-main': '#121212',
        'bgcolor-alt': '#1a1a1a',
        'bgcolor-alt-light': '#484848',
        'bgcolor-translucent': '#0000007c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#06b300',
        'theme-color-light': '#60c25c',
        'theme-color-dark': '#1da019',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#06b30080',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
              53deg,
              rgba(6, 179, 0, 1) 0%,
              rgb(104, 207, 101) 33%,
              rgba(89, 193, 186, 1) 78%,
              rgba(0, 212, 255, 1) 100%
            )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#272727',
        'header-transparent': '#00000000',
        'title-color': '#ebebeb',
        'subtitle-color': '#d8d8d8',
        'subtitle-color-light': '#b3b3b3',
        darkness: 'invert(100%)',
        'gradient-opacity': 0
      }
    }
  ] as ThemeDto[],
  customs: [] as ThemeDto[]
});

export const getters = getterTree(state, {
  selectedDefault: state => state.selectedDefault,
  selectedCustom: state => state.selectedCustom,
  defaultThemes: state => state.defaults,
  customThemes: state => state.customs,
  themeVariables: state => {
    const found = state.customs.find(el => state.selectedCustom === el.value);
    if (found !== undefined) {
      return found;
    }
    return state.defaults.find(el => state.selectedDefault === el.value);
  },
  selectedTheme: state => {
    if (state.selectedCustom.length !== 0) {
      return state.selectedCustom;
    } else {
      return state.selectedDefault;
    }
  }
});

export const mutations = mutationTree(state, {
  setDefaultTheme(state, theme: string) {
    if (state.defaults.find(e => e.value === theme)) {
      state.selectedDefault = theme;
    }
  },
  setCustomTheme(state, theme: string) {
    if (state.customs.find(e => e.value === theme)) {
      state.selectedCustom = theme;
    }
  },
  addCustomTheme(state, theme: ThemeDto) {
    if (!state.customs.find(e => e.value === theme.value)) state.customs.push(theme);
  },
  resetCustomThemes(state) {
    state.customs = [] as ThemeDto[];
    state.selectedCustom = '';
  }
});

export const actions = actionTree(
  { state, mutations },
  {
    async fetchCustomThemes() {
      await this.$axios
        .get(`${this.app.$accessor.environment.apiUrl}user/theme/themes`, {
          withCredentials: true
        })
        .then((response: { data: ThemeDto[] }) => {
          this.app.$accessor.theme.resetCustomThemes();
          if (response.data) {
            response.data.forEach(theme => {
              this.app.$accessor.theme.addCustomTheme(theme);
            });
          }
        })
        .catch((_: any) => {
          console.error(_);
          this.app.$accessor.messages.createMessage({
            type: 'error',
            title: 'Error fetching themes',
            message: 'Ask for support if problem reappears'
          });
        });
    }
  }
);
