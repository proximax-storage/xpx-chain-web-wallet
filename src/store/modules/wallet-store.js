export const walletStore = {
  // This makes your getters, mutations, and actions accessed by, eg: 'myModule/myModularizedNumber'
  // instead of mounting getters, mutations, and actions to the root namespace.
  namespaced: true,
  state: {
    currentWallet: null
  },
  getters: {
    currentWallet: state => state.currentWallet
  },
  mutations: {
    SET_CURRENT_WALLET (state, data) {
      state.currentWallet = data
    }
  }
}
