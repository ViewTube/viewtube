export const state = () => ({
  qualitySources: null
})

export const getters = {
  resolutions: state => state.qualitySources
}

export const mutations = {
  setResolutions: (state, qualitySources) =>
    (state.resolutions = qualitySources)
}
