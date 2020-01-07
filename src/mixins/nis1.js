import { Address, NEMLibrary, Account, NetworkTypes, PublicAccount } from 'nem-library'
import axios from 'axios'

export default {
  methods: {
    createAddressToString (address) {
      return new Address(address)
    },
    createAccountFromPrivateKey (privateKey) {
      return Account.createWithPrivateKey(privateKey)
    },
    createPublicAccountFromPublicKey (publicKey) {
      return PublicAccount.createWithPublicKey(publicKey)
    },
    getAccountInfoNis1 (publicAccount) {
      console.log('NIS1 PUBLIC ACCOUNT --->', publicAccount)
      const promise = new Promise(async (resolve, reject) => {
        try {
          // let cosignatoryOf = []
          // let accountsMultisigInfo = []
          const addressOwnedSwap = this.createAddressToString(publicAccount.address.pretty())
          console.log('addressOwnedSwap', addressOwnedSwap)
          const accountInfoOwnedSwap = await this.getAccountInfo(addressOwnedSwap)
          console.log('accountInfoOwnedSwap', accountInfoOwnedSwap)
          resolve({ status: false, msg: 'Swap does not support this account type' })
          /* this.sharedService.showWarning('', 'Swap does not support this account type')
          this.setNis1AccountsFound$(null)
          if (!this.walletService.currentWallet) {
            this.removeParamNis1WalletCreated(name)
          } */
        } catch (error) {

        }
      })

      return promise
    },
    getAccountInfo (address) {
      const config = this.getConfigFromNetworkNis1(NEMLibrary.getNetworkType())
      const url = `${config.nis1Config.url}/account/get?address=${address.plain()}`
      return axios.get(url)
    },
    getConfigFromNetworkNis1 (nis1Network) {
      let config = null
      console.log('nis1Network', nis1Network)
      switch (nis1Network) {
        case NetworkTypes.TEST_NET:
          config = this.$configInfo.data.environment.PUBLICTEST
          break
        case NetworkTypes.MAIN_NET:
          config = this.$configInfo.data.environment.MAINNET
          break
      }

      console.log('retornando aqui', config)
      return config
    },
    setNetworkFromCatapultNet (catapultNetwork) {
      NEMLibrary.reset()
      console.log('catapultNetwork', catapultNetwork)
      const siriusNetwork = this.$blockchainProvider.getNetworkTypes()
      switch (catapultNetwork) {
        case siriusNetwork.testnet.value:
          NEMLibrary.bootstrap(NetworkTypes.TEST_NET)
          console.log(NEMLibrary.getNetworkType())
          break
        case siriusNetwork.mainnet.value:
          NEMLibrary.bootstrap(NetworkTypes.MAIN_NET)
          break
      }
    }
  }
}
