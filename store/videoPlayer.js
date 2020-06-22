export const state = () => ({
  resolutions: null
})

export const getters = {
  resolutions: (state) => state.resolutions,
}

export const mutations = {
  setResolutions(state, resolutions) {
    state.resolutions = resolutions
  }
}
