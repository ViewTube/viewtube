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
  register({ commit }, user, password, captchaSolution) { }
}