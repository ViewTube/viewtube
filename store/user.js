import Axios from 'axios'
import Cookie from 'universal-cookie'
import Commons from '@/plugins/commons'

const cookie = new Cookie()

export const state = () => ({
  username: null
})
export const getters = {
  username: state => state.username,
  isLoggedIn: state => Boolean(state.username),
  jwt: () => cookie.get('jwt') || undefined
}
export const mutations = {
  setUsername(state, username) {
    state.username = username
  },
  setJwt(state, jwt) {
    cookie.set('jwt', jwt, {
      domain: 'https://viewtube.io',
      secure: true,
      sameSite: 'strict'
    })
  }
}
export const actions = {
  login({ commit }, { username, password }) {
    Axios.post(Commons.getOwnApiUrl() + 'auth/login', {
      username,
      password
    })
      .then((result) => {
        commit('setJwt', result.data.accessToken)
      })
  },
  register({ commit, rootState }, { username, password, captchaSolution }) {
    const captchaToken = rootState.captcha.token
    if (captchaToken) {
      return Axios.post(Commons.getOwnApiUrl() + 'register', {
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
          console.log(err.message)
          throw new Error('Registration failed: ' + err.message)
        })
    }
  }
}
