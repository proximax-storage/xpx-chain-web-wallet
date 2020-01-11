import { AccountHttp, AssetHttp, NEMLibrary } from 'nem-library'

export const swapStore = {
  // This makes your getters, mutations, and actions accessed by, eg: 'myModule/myModularizedNumber'
  // instead of mounting getters, mutations, and actions to the root namespace.
  namespaced: true,
  state: {
    accountHttp: null,
    assetHttp: null,
    addressToSwap: null,
    configNIS1: null,
    swapData: null,
    divisibility: 6,
    namespace: {
      root: 'prx',
      sub: 'xpx'
    }
  },
  getters: {
    addressToSwap: state => state.addressToSwap,
    accountHttp: state => state.accountHttp,
    assetHttp: state => state.assetHttp,
    configNIS1: state => state.configNIS1,
    environment: state => state,
    divisibility: state => state.divisibility,
    namespace: state => state.namespace,
    swapData: state => state.swapData
  },
  mutations: {
    SET_SWAP_DATA (state, data) {
      state.swapData = data
    },
    SET_ADDRESS_TO_SWAP (state, data) {
      state.addressToSwap = data
    },
    INIT_ENVIRONMENT_SWAP (state, data) {
      NEMLibrary.reset()
      console.log(data.networkNis1)
      NEMLibrary.bootstrap(data.networkNis1)
      state.configNIS1 = data.configNIS1
      state.accountHttp = new AccountHttp(data.configNIS1.nodes)
      state.assetHttp = new AssetHttp(data.configNIS1.nodes)
    }
  }
}
