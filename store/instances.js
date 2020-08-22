import Commons from '@/plugins/commons'

export const state = () => ({
  currentInstance: '',
  instances: []
})
export const getters = {
  currentInstance(state) {
    return state.currentInstance
  },
  instances(state) {
    return state.instances
  }
}
export const mutations = {
  changeInstance(state, instance) {
    state.currentInstance = instance
  },
  addInstance(state, { url, health }) {
    state.instances.push({ url, health })
  },
  clearInstances(state) {
    state.instances = []
  }
}
export const actions = {
  fetchInstances({ commit, state }) {
    commit('clearInstances')
    this.$axios
      .get(`${Commons.proxyUrl}https://raw.githubusercontent.com/wiki/iv-org/invidious/Invidious-Instances.md`)
      .then((response) => {
        const fetchData = response.data.split('### Blocked:')[0]
        const regex = /\[(?<host>[^ \]]+)\]\((?<uri>[^)]+)\)(?! - offline)/g
        const matches = [...fetchData.matchAll(regex)]
        for (const match of matches) {
          if (!match[2].includes('.onion') && !match[2].includes('.i2p')) {
            if (match[2].endsWith('/')) {
              commit('addInstance', {
                url: match[2].substring(0, match[2].length - 1),
                health: null
              })
            } else {
              commit('addInstance', {
                url: match[2], health: null
              })
            }
          }
        }
        if (state.currentInstance.length === 0) {
          commit('changeInstance', matches[0][2])
        }
      })
  }
}
