export const accountStore = {
  // This makes your getters, mutations, and actions accessed by, eg: 'myModule/myModularizedNumber'
  // instead of mounting getters, mutations, and actions to the root namespace.
  namespaced: true,
  state: {
    dataUser: null,
    isLogged: false
  },
  getters: {
    userData: state => state.dataUser,
    isLogged: state => state.isLogged,
    address: state => state.dataUser.simpleWallet.address['address']
  },
  mutations: {
    LOGIN (state, data) {
      if (data && data.username && data.simpleWallet) {
        state.isLogged = true
      } else {
        state.isLogged = false
      }
      state.dataUser = data
    },
    UPDATE_DATA_USER (state, data) {
      state.dataUser = data
    },
    CHANGE_NAME_USER (state, name) {
      state.dataUser.name = name
    }
  },
  actions: {
    LOGOUT ({ commit }, data) {
      commit('LOGIN', null)
    }
  }
}
