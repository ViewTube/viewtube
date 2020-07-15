import Axios from 'axios'
import Cookie from 'universal-cookie'
import Commons from '@/plugins/commons'

export const state = () => ({
  username: null
})
export const getters = {
  username: state => state.username,
  isLoggedIn: state => Boolean(state.username),
  jwt: () => {
    const cookie = new Cookie()
    return cookie.get('jwt') || undefined
  }
}
export const mutations = {
  setUsername(state, username) {
    state.username = username
  },
  setJwt(state, jwt) {
    const cookie = new Cookie()
    cookie.set('jwt', jwt, {
      domain: window.location.hostname,
      secure: true,
      sameSite: 'strict'
    })
  }
}
export const actions = {
  getUser({ getters, commit }) {
    console.log('getting user...')
    if (getters.jwt) {
      this.$axios.get(Commons.getOwnApiUrl() + 'user/profile', {
        headers: {
          Authorization: `Bearer ${getters.jwt}`
        }
      })
        .then((result) => {
          commit('setUsername', result.data.username)
        })
    }
  },
  login({ commit, dispatch, getters }, { username, password }) {
    return this.$axios.post(Commons.getOwnApiUrl() + 'auth/login', {
      username,
      password
    }, { withCredentials: true })
      .then((result) => {
        // commit('setJwt', result.data.accessToken)
        console.log(result.data.accessToken)
        dispatch('getUser')
        return result
      })
  },
  register({ commit, rootState }, { username, password, captchaSolution }) {
    const captchaToken = rootState.captcha.token
    if (captchaToken) {
      return Axios.post(Commons.getOwnApiUrl() + 'auth/register', {
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
