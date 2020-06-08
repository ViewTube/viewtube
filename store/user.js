import Commons from '@/plugins/commons'
import Axios from 'axios'

export const state = () => ({
  username: null
})
export const getters = {
  username: (state) => state.username,
  isLoggedIn: (state) => Boolean(state.username)
}
export const mutations = {
  setUsername(state, username) {
    state.username = username
  }
}
export const actions = {
  login({ commit }, user, password) { },
  register({ commit, rootState }, { username, password, captchaSolution }) {
    const captchaToken = rootState.captcha.token
    if (captchaToken) {
      return Axios.post(Commons.getOwnApiUrl() + 'user', {
        username,
        password,
        captchaToken,
        captchaSolution
      })
        .then((result) => {
          if (result.data.success) {
            commit('setUsername', result.data.username)
            return result.data.username
          }
        }, (reason) => {
          // console.log(reason)
          throw new Error('Registration failed: ' + reason)
        })
        .catch((err) => {
          // console.log(err)
          throw new Error('Registration failed: ' + err.message)
        })
    }
  }
}
