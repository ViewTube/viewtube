export default {
  state: {
    messages: []
  },
  getters: {
    allMessages: (state) => state.messages,
    visibleMessages: (state) => state.messages.filter(el => el.dismissed === false)
  },
  actions: {
    createMessage(context, { type = 'info', title, message, clickAction = null }) {
      let id = context.getters.allMessages.length + 1
      context.commit('addMessage', {
        id: id,
        type: type,
        title: title,
        message: message,
        clickAction: clickAction,
        dismissed: false,
        dismiss: () => context.commit('dismissMessage', id)
      })
    }
  },
  mutations: {
    addMessage(state, message) {
      state.messages.push(message)
    },
    dismissMessage(state, id) {
      state.messages.find(e => e.id === id).dismissed = true
    }
  }
}
