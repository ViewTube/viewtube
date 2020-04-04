export const state = () => ({
  scrollPosition: 0,
  prevScrollPosition: 0,
  scrollDown: false
})

export const getters = {
  scrollPosition: (state) => state.scrollPosition,
  scrolledTop: (state) => state.scrollPosition <= 0
}

export const mutations = {
  setScrollPosition(state, pos) {
    state.scrollPosition = pos
    if (state.prevScrollPosition > state.scrollPosition) {
      state.scrollDown = false
    } else {
      state.scrollDown = true
    }
    state.prevScrollPosition = state.scrollPosition
  }
}
