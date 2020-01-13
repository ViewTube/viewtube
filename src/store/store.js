import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import settingsModule from '@/store/settings'
import instancesModule from '@/store/instances'
import miniplayerModule from '@/store/miniplayer'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  modules: ['settings', 'instances']
})

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    settings: settingsModule,
    instances: instancesModule,
    miniplayer: miniplayerModule
  },
  plugins: [vuexLocal.plugin]
})
