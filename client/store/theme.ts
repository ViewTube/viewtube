import { ThemesDto } from 'server/user/themes/dto/themes.dto';
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import Axios from 'axios';

@Module({
  name: 'theme',
  stateFactory: true,
  namespaced: true
})
class Theme extends VuexModule {
  currentTheme = 'default';
  allThemes: ThemesDto[] = [
    {
      key: 'default',
      name: 'Dark Theme',
      default: true,
      variables: [
        ['bgcolor-main', '#121212'],
        ['bgcolor-alt', '#1a1a1a'],
        ['bgcolor-alt-light', '#484848'],
        ['bgcolor-translucent', '#0000007c'],
        ['error-color-green', '#4caf50'],
        ['error-color-red', '#d93025'],
        ['theme-color', '#ff7b3a'],
        ['theme-color-light', '#f5af19'],
        ['theme-color-dark', '#f12711'],
        ['theme-color-alt', '#108dc7'],
        ['theme-color-translucent', '#ff7b3a80'],
        ['line-color', 'rgba(255, 255, 255, 0.2)'],
        ['line-accent-color', 'rgba(255, 255, 255, 0.4)'],
        [
          'theme-color-gradient',
          `linear-gradient(53deg,rgba(241, 87, 10, 1) 0%,rgba(224, 140, 112, 1) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100%)`
        ],
        ['shadow-load-color', '#535353b6'],
        ['header-bgcolor', '#272727'],
        ['header-transparent', '#00000000'],
        ['title-color', '#ebebeb'],
        ['subtitle-color', '#d8d8d8'],
        ['subtitle-color-light', '#b3b3b3'],
        ['darkness', 'invert(90%)'],
        ['gradient-opacity', '1']
      ]
    },
    {
      key: 'default_light',
      name: 'Light Theme',
      default: true,
      variables: [
        ['bgcolor-main', '#ffffff'],
        ['bgcolor-alt', '#ffffff'],
        ['bgcolor-alt-light', '#dadada'],
        ['bgcolor-translucent', '#ffffff7c'],
        ['error-color-green', '#4caf50'],
        ['error-color-red', '#d93025'],
        ['theme-color', '#ff7b3a'],
        ['theme-color-light', '#f5af19'],
        ['theme-color-dark', '#f12711'],
        ['theme-color-alt', '#108dc7'],
        ['theme-color-translucent', '#ff7b3a80'],
        ['line-color', 'rgba(255, 255, 255, 0.2)'],
        ['line-accent-color', 'rgba(255, 255, 255, 0.4)'],
        [
          'theme-color-gradient',
          `linear-gradient(53deg,rgba(241, 87, 10, 1) 0%,rgba(224, 140, 112, 1) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100%)`
        ],
        ['shadow-load-color', '#535353b6'],
        ['header-bgcolor', '#ffffff'],
        ['header-transparent', '#ffffff'],
        ['title-color', '#080808'],
        ['subtitle-color', '#333333'],
        ['subtitle-color-light', '#4e4e4e'],
        ['darkness', 'invert(0%)'],
        ['gradient-opacity', '0']
      ]
    },
    {
      key: 'default_dark_no_gradient',
      name: 'Dark theme without background gradients',
      default: true,
      variables: [
        ['bgcolor-main', '#121212'],
        ['bgcolor-alt', '#1a1a1a'],
        ['bgcolor-alt-light', '#484848'],
        ['bgcolor-translucent', '#0000007c'],
        ['error-color-green', '#4caf50'],
        ['error-color-red', '#d93025'],
        ['theme-color', '#ff7b3a'],
        ['theme-color-light', '#f5af19'],
        ['theme-color-dark', '#f12711'],
        ['theme-color-alt', '#108dc7'],
        ['theme-color-translucent', '#ff7b3a80'],
        ['line-color', 'rgba(255, 255, 255, 0.2)'],
        ['line-accent-color', 'rgba(255, 255, 255, 0.4)'],
        [
          'theme-color-gradient',
          `linear-gradient(53deg,rgba(241, 87, 10, 1) 0%,rgba(224, 140, 112, 1) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100%)`
        ],
        ['shadow-load-color', '#535353b6'],
        ['header-bgcolor', '#272727'],
        ['header-transparent', '#00000000'],
        ['title-color', '#ebebeb'],
        ['subtitle-color', '#d8d8d8'],
        ['subtitle-color-light', '#b3b3b3'],
        ['darkness', 'invert(90%)'],
        ['gradient-opacity', '0']
      ]
    },
    {
      key: 'default_black',
      name: 'Black theme',
      default: true,
      variables: [
        ['bgcolor-main', '#000000'],
        ['bgcolor-alt', '#1a1a1a'],
        ['bgcolor-alt-light', '#484848'],
        ['bgcolor-translucent', '#0000007c'],
        ['error-color-green', '#4caf50'],
        ['error-color-red', '#d93025'],
        ['theme-color', '#ff7b3a'],
        ['theme-color-light', '#f5af19'],
        ['theme-color-dark', '#f12711'],
        ['theme-color-alt', '#108dc7'],
        ['theme-color-translucent', '#ff7b3a80'],
        ['line-color', 'rgba(255, 255, 255, 0.2)'],
        ['line-accent-color', 'rgba(255, 255, 255, 0.4)'],
        [
          'theme-color-gradient',
          `linear-gradient(53deg,rgba(241, 87, 10, 1) 0%,rgba(224, 140, 112, 1) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100%)`
        ],
        ['shadow-load-color', '#535353b6'],
        ['header-bgcolor', '#272727'],
        ['header-transparent', '#00000000'],
        ['title-color', '#ebebeb'],
        ['subtitle-color', '#d8d8d8'],
        ['subtitle-color-light', '#b3b3b3'],
        ['darkness', 'invert(100%)'],
        ['gradient-opacity', '1']
      ]
    },
    {
      key: 'default_dark_green',
      name: 'Dark green theme',
      default: true,
      variables: [
        ['bgcolor-main', '#121212'],
        ['bgcolor-alt', '#1a1a1a'],
        ['bgcolor-alt-light', '#484848'],
        ['bgcolor-translucent', '#0000007c'],
        ['error-color-green', '#4caf50'],
        ['error-color-red', '#d93025'],
        ['theme-color', '#06b300'],
        ['theme-color-light', '#60c25c'],
        ['theme-color-dark', '#1da019'],
        ['theme-color-alt', '#108dc7'],
        ['theme-color-translucent', '#06b30080'],
        ['line-color', 'rgba(255, 255, 255, 0.2)'],
        ['line-accent-color', 'rgba(255, 255, 255, 0.4)'],
        [
          'theme-color-gradient',
          `linear-gradient(53deg,rgba(6, 179, 0, 1) 0%,rgb(104, 207, 101) 33%,rgba(89, 193, 186, 1) 78%,rgba(0, 212, 255, 1) 100% )`
        ],
        ['shadow-load-color', '#535353b6'],
        ['header-bgcolor', '#272727'],
        ['header-transparent', '#00000000'],
        ['title-color', '#ebebeb'],
        ['subtitle-color', '#d8d8d8'],
        ['subtitle-color-light', '#b3b3b3'],
        ['darkness', 'invert(100%)'],
        ['gradient-opacity', '0']
      ]
    }
  ];

  get theme() {
    return this.currentTheme;
  }

  get themes() {
    return this.allThemes;
  }

  get themeVariables() {
    return this.allThemes.find(el => this.currentTheme === el.key);
  }

  get defaultThemes() {
    const defaultThemes = [];
    this.allThemes.forEach(element => {
      if (element.default) {
        defaultThemes.push(element);
      }
    });
    return defaultThemes;
  }

  @Mutation
  setTheme(themeKey: string) {
    if (this.themes.find(e => e.key === themeKey)) {
      this.currentTheme = themeKey;
    }
  }

  @Mutation
  addTheme(theme: ThemesDto) {
    this.allThemes.push(theme);
  }

  @Mutation
  resetThemes() {
    for (let i = this.allThemes.length - 1; i >= 0; i -= 1) {
      if (!this.allThemes[i].default) {
        this.allThemes.splice(i);
      }
    }
  }

  @Action
  async fetchThemes() {
    await Axios.get(`${this.context.rootState.env.apiUrl}user/themes`, {
      withCredentials: true
    })
      .then(result => {
        result.data.forEach(element => {
          this.context.commit('addTheme', element);
        });
      })
      .catch(console.log);
  }
}
