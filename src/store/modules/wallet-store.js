export const walletStore = {
  // This makes your getters, mutations, and actions accessed by, eg: 'myModule/myModularizedNumber'
  // instead of mounting getters, mutations, and actions to the root namespace.
  namespaced: true,
  state: {
    dataSwap: null
  },
  getters: {
    dataSwap: state => state.dataSwap
  },
  mutations: {
    SET_DATA_SWAP (state, data) {
      state.dataSwap = data
    }
  }
}
