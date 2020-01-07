import Vue from 'vue'
import Vuex from 'vuex'
import { accountStore } from './modules/account-store'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    configInfo: null,
    environment: null,
    overlay: false,
    snackbar: {
      color: '',
      mode: '',
      snackbar: false,
      text: '',
      timeout: 6000,
      x: 'bottom',
      y: 'bottom'
    }
  },
  mutations: {
    ADD_CONFIG_INFO (state, data) {
      state.configInfo = data
    },
    SHOW_LOADING (state, value) {
      state.overlay = value
    },
    SHOW_SNACKBAR (state, data) {
      const { snackbar, text, color } = data
      state.snackbar.snackbar = snackbar
      state.snackbar.text = text
      state.snackbar.color = color
    }
  },
  actions: {
    showMSG ({ commit }, data) {
      commit('SHOW_SNACKBAR', data)
    }
  },
  getters: {
    nameApp: state => state.configInfo.nameApp,
    pseudonymApp: state => state.configInfo.pseudonymApp
  },
  modules: {
    accountStore
  }
})
