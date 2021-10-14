import { declareActionTree } from '@/plugins/actionTree.shim';
import { getterTree, mutationTree } from 'typed-vuex';

export const state = () => ({
  messages: [{}] as [
    {
      id: number;
      type: string;
      title: string;
      message: string;
      clickAction: string;
      dismissed: boolean;
      dismissDelay: number;
    }
  ]
});

export const getters = getterTree(state, {
  allMessages: state => state.messages,
  visibleMessages: state => state.messages.filter(el => el.dismissed === false)
});

export const mutations = mutationTree(state, {
  addMessage(state, message) {
    state.messages.push(message);
  },
  dismissMessage(state, id) {
    state.messages.find(e => e.id === id).dismissed = true;
  }
});

export const actions = declareActionTree(
  { getters, state, mutations },
  {
    createMessage(
      { commit, getters },
      { type = 'info', title, message, clickAction = null, dismissDelay = 5000 }
    ) {
      const id = getters.allMessages.length + 1;
      commit('addMessage', {
        id,
        type,
        title,
        message,
        clickAction,
        dismissed: false,
        dismissDelay
      });
    }
  }
);
