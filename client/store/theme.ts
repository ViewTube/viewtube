import Axios from 'axios';
import { actionTree, getterTree, mutationTree } from 'nuxt-typed-vuex';
import { ThemeVariableType } from '../../server/user/themes/dto/theme-variables.dto';
import { ThemesDto } from '../../server/user/themes/dto/themes.dto';

export const state = () => ({
  currentTheme: 'default' as string,
  allThemes: [
    {
      key: 'default',
      name: 'Dark Theme',
      default: true,
      username: '',
      variables: [
        { variableKey: 'bgcolor-main', variableValue: '#121212' },
        { variableKey: 'bgcolor-alt', variableValue: '#1a1a1a' },
        { variableKey: 'bgcolor-alt-light', variableValue: '#484848' },
        { variableKey: 'bgcolor-translucent', variableValue: '#0000007c' },
        { variableKey: 'error-color-green', variableValue: '#4caf50' },
        { variableKey: 'error-color-red', variableValue: '#d93025' },
        { variableKey: 'theme-color', variableValue: '#ff7b3a' },
        { variableKey: 'theme-color-light', variableValue: '#f5af19' },
        { variableKey: 'theme-color-dark', variableValue: '#f12711' },
        { variableKey: 'theme-color-alt', variableValue: '#108dc7' },
        { variableKey: 'theme-color-translucent', variableValue: '#ff7b3a80' },
        { variableKey: 'line-color', variableValue: 'rgba(255, 255, 255, 0.2)' },
        { variableKey: 'line-accent-color', variableValue: 'rgba(255, 255, 255, 0.4)' },
        {
          variableKey: 'theme-color-gradient',
          variableValue: `linear-gradient(53deg,rgba(241, 87, 10, 1) 0%,rgba(224, 140, 112, 1) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100%)`
        },
        { variableKey: 'shadow-load-color', variableValue: '#535353b6' },
        { variableKey: 'header-bgcolor', variableValue: '#272727' },
        { variableKey: 'header-transparent', variableValue: '#00000000' },
        { variableKey: 'title-color', variableValue: '#ebebeb' },
        { variableKey: 'subtitle-color', variableValue: '#d8d8d8' },
        { variableKey: 'subtitle-color-light', variableValue: '#b3b3b3' },
        { variableKey: 'darkness', variableValue: 'invert(90%)' },
        { variableKey: 'gradient-opacity', variableValue: '1' }
      ]
    },
    {
      key: 'default_light',
      name: 'Light Theme',
      default: true,
      username: '',
      variables: [
        { variableKey: 'bgcolor-main', variableValue: '#ffffff' },
        { variableKey: 'bgcolor-alt', variableValue: '#ffffff' },
        { variableKey: 'bgcolor-alt-light', variableValue: '#dadada' },
        { variableKey: 'bgcolor-translucent', variableValue: '#ffffff7c' },
        { variableKey: 'error-color-green', variableValue: '#4caf50' },
        { variableKey: 'error-color-red', variableValue: '#d93025' },
        { variableKey: 'theme-color', variableValue: '#ff7b3a' },
        { variableKey: 'theme-color-light', variableValue: '#f5af19' },
        { variableKey: 'theme-color-dark', variableValue: '#f12711' },
        { variableKey: 'theme-color-alt', variableValue: '#108dc7' },
        { variableKey: 'theme-color-translucent', variableValue: '#ff7b3a80' },
        { variableKey: 'line-color', variableValue: 'rgba(255, 255, 255, 0.2)' },
        { variableKey: 'line-accent-color', variableValue: 'rgba(255, 255, 255, 0.4)' },
        {
          variableKey: 'theme-color-gradient',
          variableValue: `linear-gradient(53deg,rgba(241, 87, 10, 1) 0%,rgba(224, 140, 112, 1) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100%)`
        },
        { variableKey: 'shadow-load-color', variableValue: '#535353b6' },
        { variableKey: 'header-bgcolor', variableValue: '#ffffff' },
        { variableKey: 'header-transparent', variableValue: '#ffffff' },
        { variableKey: 'title-color', variableValue: '#080808' },
        { variableKey: 'subtitle-color', variableValue: '#333333' },
        { variableKey: 'subtitle-color-light', variableValue: '#4e4e4e' },
        { variableKey: 'darkness', variableValue: 'invert(0%)' },
        { variableKey: 'gradient-opacity', variableValue: '0' }
      ]
    },
    {
      key: 'default_dark_no_gradient',
      name: 'Dark theme without background gradients',
      default: true,
      username: '',
      variables: [
        { variableKey: 'bgcolor-main', variableValue: '#121212' },
        { variableKey: 'bgcolor-alt', variableValue: '#1a1a1a' },
        { variableKey: 'bgcolor-alt-light', variableValue: '#484848' },
        { variableKey: 'bgcolor-translucent', variableValue: '#0000007c' },
        { variableKey: 'error-color-green', variableValue: '#4caf50' },
        { variableKey: 'error-color-red', variableValue: '#d93025' },
        { variableKey: 'theme-color', variableValue: '#ff7b3a' },
        { variableKey: 'theme-color-light', variableValue: '#f5af19' },
        { variableKey: 'theme-color-dark', variableValue: '#f12711' },
        { variableKey: 'theme-color-alt', variableValue: '#108dc7' },
        { variableKey: 'theme-color-translucent', variableValue: '#ff7b3a80' },
        { variableKey: 'line-color', variableValue: 'rgba(255, 255, 255, 0.2)' },
        { variableKey: 'line-accent-color', variableValue: 'rgba(255, 255, 255, 0.4)' },
        {
          variableKey: 'theme-color-gradient',
          variableValue: `linear-gradient(53deg,rgba(241, 87, 10, 1) 0%,rgba(224, 140, 112, 1) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100%)`
        },
        { variableKey: 'shadow-load-color', variableValue: '#535353b6' },
        { variableKey: 'header-bgcolor', variableValue: '#272727' },
        { variableKey: 'header-transparent', variableValue: '#00000000' },
        { variableKey: 'title-color', variableValue: '#ebebeb' },
        { variableKey: 'subtitle-color', variableValue: '#d8d8d8' },
        { variableKey: 'subtitle-color-light', variableValue: '#b3b3b3' },
        { variableKey: 'darkness', variableValue: 'invert(90%)' },
        { variableKey: 'gradient-opacity', variableValue: '0' }
      ]
    },
    {
      key: 'default_black',
      name: 'Black theme',
      default: true,
      username: '',
      variables: [
        { variableKey: 'bgcolor-main', variableValue: '#000000' },
        { variableKey: 'bgcolor-alt', variableValue: '#1a1a1a' },
        { variableKey: 'bgcolor-alt-light', variableValue: '#484848' },
        { variableKey: 'bgcolor-translucent', variableValue: '#0000007c' },
        { variableKey: 'error-color-green', variableValue: '#4caf50' },
        { variableKey: 'error-color-red', variableValue: '#d93025' },
        { variableKey: 'theme-color', variableValue: '#ff7b3a' },
        { variableKey: 'theme-color-light', variableValue: '#f5af19' },
        { variableKey: 'theme-color-dark', variableValue: '#f12711' },
        { variableKey: 'theme-color-alt', variableValue: '#108dc7' },
        { variableKey: 'theme-color-translucent', variableValue: '#ff7b3a80' },
        { variableKey: 'line-color', variableValue: 'rgba(255, 255, 255, 0.2)' },
        { variableKey: 'line-accent-color', variableValue: 'rgba(255, 255, 255, 0.4)' },
        {
          variableKey: 'theme-color-gradient',
          variableValue: `linear-gradient(53deg,rgba(241, 87, 10, 1) 0%,rgba(224, 140, 112, 1) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100%)`
        },
        { variableKey: 'shadow-load-color', variableValue: '#535353b6' },
        { variableKey: 'header-bgcolor', variableValue: '#272727' },
        { variableKey: 'header-transparent', variableValue: '#00000000' },
        { variableKey: 'title-color', variableValue: '#ebebeb' },
        { variableKey: 'subtitle-color', variableValue: '#d8d8d8' },
        { variableKey: 'subtitle-color-light', variableValue: '#b3b3b3' },
        { variableKey: 'darkness', variableValue: 'invert(100%)' },
        { variableKey: 'gradient-opacity', variableValue: '1' }
      ]
    },
    {
      key: 'default_dark_green',
      name: 'Dark green theme',
      default: true,
      username: '',
      variables: [
        { variableKey: 'bgcolor-main', variableValue: '#121212' },
        { variableKey: 'bgcolor-alt', variableValue: '#1a1a1a' },
        { variableKey: 'bgcolor-alt-light', variableValue: '#484848' },
        { variableKey: 'bgcolor-translucent', variableValue: '#0000007c' },
        { variableKey: 'error-color-green', variableValue: '#4caf50' },
        { variableKey: 'error-color-red', variableValue: '#d93025' },
        { variableKey: 'theme-color', variableValue: '#06b300' },
        { variableKey: 'theme-color-light', variableValue: '#60c25c' },
        { variableKey: 'theme-color-dark', variableValue: '#1da019' },
        { variableKey: 'theme-color-alt', variableValue: '#108dc7' },
        { variableKey: 'theme-color-translucent', variableValue: '#06b30080' },
        { variableKey: 'line-color', variableValue: 'rgba(255, 255, 255, 0.2)' },
        { variableKey: 'line-accent-color', variableValue: 'rgba(255, 255, 255, 0.4)' },
        {
          variableKey: 'theme-color-gradient',
          variableValue: `linear-gradient(53deg,rgba(6, 179, 0, 1) 0%,rgb(104, 207, 101) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100% )`
        },
        { variableKey: 'shadow-load-color', variableValue: '#535353b6' },
        { variableKey: 'header-bgcolor', variableValue: '#272727' },
        { variableKey: 'header-transparent', variableValue: '#00000000' },
        { variableKey: 'title-color', variableValue: '#ebebeb' },
        { variableKey: 'subtitle-color', variableValue: '#d8d8d8' },
        { variableKey: 'subtitle-color-light', variableValue: '#b3b3b3' },
        { variableKey: 'darkness', variableValue: 'invert(100%)' },
        { variableKey: 'gradient-opacity', variableValue: '0' }
      ]
    }
  ] as ThemesDto[]
});

export const getters = getterTree(state, {
  currentTheme(state): string {
    return state.currentTheme;
  },
  themes(state): ThemesDto[] {
    return state.allThemes;
  },
  themeVariables(state): ThemeVariableType[] {
    return state.allThemes.find(el => state.currentTheme === el.key).variables;
  },
  defaultThemes(state): ThemesDto[] {
    const defaultThemes = [];
    state.allThemes.forEach(element => {
      if (element.default) {
        defaultThemes.push(element);
      }
    });
    return defaultThemes;
  }
});

export const mutations = mutationTree(state, {
  setTheme(state, themeKey: string) {
    if (state.allThemes.find(e => e.key === themeKey)) {
      state.currentTheme = themeKey;
    }
  },
  addTheme(state, theme: ThemesDto) {
    state.allThemes.push(theme);
  }
});

export const actions = actionTree(
  {
    state,
    mutations
  },
  {
    async fetchThemes() {
      await Axios.get(`${this.app.$accessor.environment.apiUrl}user/themes`, {
        withCredentials: true
      })
        .then(result => {
          console.log(result);
          result.data.forEach((element: ThemesDto) => {
            this.app.$accessor.theme.addTheme(element);
          });
        })
        .catch(console.log);
    },
    resetThemes(rootState) {
      for (let i = rootState.state.allThemes.length - 1; i >= 0; i -= 1) {
        if (!rootState.state.allThemes[i].default) {
          rootState.state.allThemes.splice(i);
        }
      }
    }
  }
);
