export default {
  theme: 'default',
  defaults: {
    theme: [
      { value: 'default', name: 'Dark Theme' },
      { value: 'light', name: 'Light Theme' },
      { value: 'dark-no-gradient', name: 'Dark Theme without background gradients' },
      { value: 'black', name: 'Black Theme' }
    ]
  },

  init() {
    if (localStorage.getItem('theme')) {
      this.theme = localStorage.getItem('theme')
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches === false) {
        this.setTheme('light')
      }
    }
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme)
    this.theme = theme
  },

  getTheme() {
    return this.theme
  }
}
