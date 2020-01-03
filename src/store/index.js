import Vue from 'vue'
import Vuex from 'vuex'
import { accountStore } from './modules/account-store'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    configInfo: null
  },
  mutations: {
    ADD_CONFIG_INFO (state, data) {
      state.configInfo = data
    }
  },
  actions: {
  },
  getters: {
    nameApp: state => state.configInfo.nameApp,
    pseudonymApp: state => state.configInfo.pseudonymApp
  },
  modules: {
    accountStore
  }
})
