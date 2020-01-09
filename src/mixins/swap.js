import axios from 'axios'
import { Account, AccountOwnedAssetService, Address, NetworkTypes, PublicAccount } from 'nem-library'

export default {
  data: () => {
    return {
      configNIS1: null,
      namespace: null,
      divisibility: null
    }
  },
  methods: {
    async validateBalanceAccounts (xpxFound, addressSigner) {
      const env = this.$store.getters['swapStore/environment']
      const quantityFillZeros = this.$generalService.addZeros(env.divisibility, xpxFound.quantity)
      let realQuantity = this.$generalService.amountFormatter(quantityFillZeros, xpxFound, env.divisibility)
      const unconfirmedTxn = await this.getUnconfirmedTransaction(addressSigner)
      if (unconfirmedTxn.length > 0) {
        for (const item of unconfirmedTxn) {
          let existMosaic = null
          if (item.type === 257 && item['signer']['address']['value'] === addressSigner['value'] && item['_assets'].length > 0) {
            existMosaic = item['_assets'].find(
              (mosaic) => mosaic.assetId.namespaceId === env.namespace.root && mosaic.assetId.name === env.namespace.sub
            )
          } else if (
            item.type === 4100 &&
            item['otherTransaction']['type'] === 257 &&
            item['otherTransaction']['signer']['address']['value'] === addressSigner['value']
          ) {
            existMosaic = item['otherTransaction']['_assets'].find(
              (mosaic) => mosaic.assetId.namespaceId === env.namespace.root && mosaic.assetId.name === env.namespace.sub
            )
          }

          if (existMosaic) {
            const unconfirmedFormatter = parseFloat(this.$generalService.amountFormatter(existMosaic.quantity, xpxFound, env.divisibility))
            const quantityWhitoutFormat = realQuantity.split(',').join('')
            const residue = this.transactionService.subtractAmount(parseFloat(quantityWhitoutFormat), unconfirmedFormatter)
            const quantityFormat = this.$generalService.amountFormatter(parseInt((residue).toString().split('.').join('')), xpxFound, env.divisibility)
            realQuantity = quantityFormat
          }
        }
      }

      return realQuantity
    },
    async searchInfoAccountMultisig (accountInfoOwnedSwap, cosignatoryOf, accountsMultisigInfo) {
      if (accountInfoOwnedSwap.data.meta.cosignatoryOf.length > 0) {
        cosignatoryOf = accountInfoOwnedSwap.data.meta.cosignatoryOf
        for (let multisig of cosignatoryOf) {
          try {
            const addressMultisig = this.createAddressToString(multisig.address)
            const ownedMosaic = await this.getOwnedMosaics(addressMultisig)
            const namespace = this.$store.getters['swapStore/namespace']
            const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === namespace.root && el.assetId.name === namespace.sub)
            if (xpxFound) {
              multisig.balance = await this.validateBalanceAccounts(xpxFound, addressMultisig)
              multisig.mosaic = xpxFound
              accountsMultisigInfo.push(multisig)
            }
          } catch (error) {
            cosignatoryOf = []
            accountsMultisigInfo = []
          }
        }
      }

      return {
        cosignatoryOf,
        accountsMultisigInfo
      }
    },
    async searchMosaicInfoOwnedSwap (addressOwnedSwap, publicAccount, accountsMultisigInfo, cosignatoryOf) {
      let nis1AccountsInfo = null
      try {
        // SEARCH INFO OWNED SWAP
        const namespace = this.$store.getters['swapStore/namespace']
        const ownedMosaic = await this.getOwnedMosaics(addressOwnedSwap)
        const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === namespace.root && el.assetId.name === namespace.sub)
        if (xpxFound) {
          const balance = await this.validateBalanceAccounts(xpxFound, addressOwnedSwap)
          const params = { publicAccount, accountsMultisigInfo, balance, cosignersAccounts: cosignatoryOf, isMultiSign: false, name, xpxFound }
          nis1AccountsInfo = this.buildAccountInfoNIS1(params)
          // this.setNis1AccountsFound$(nis1AccountsInfo)
        } else if (cosignatoryOf.length > 0) {
          const params = { publicAccount, accountsMultisigInfo, balance: null, cosignersAccounts: cosignatoryOf, isMultiSign: false, name, xpxFound: null }
          nis1AccountsInfo = this.buildAccountInfoNIS1(params)
          // this.setNis1AccountsFound$(nis1AccountsInfo)
        } else {
          // this.setNis1AccountsFound$(null)
          this.$store.commit('SHOW_SNACKBAR', {
            snackbar: true,
            text: 'The account has no balance to swap',
            color: 'warning'
          })
        }
      } catch (error) {
        // this.setNis1AccountsFound$(null)
        this.$store.commit('SHOW_SNACKBAR', {
          snackbar: true,
          text: 'It was not possible to connect to the server, try later',
          color: 'error'
        })
      }

      return nis1AccountsInfo
    },
    buildAccountInfoNIS1 (data) {
      let cosignatoryOf = false
      if (data.cosignersAccounts.length > 0) {
        cosignatoryOf = true
      }

      return {
        nameAccount: data.name,
        address: data.publicAccount.address,
        publicKey: data.publicAccount.publicKey,
        cosignerOf: cosignatoryOf,
        cosignerAccounts: data.cosignersAccounts,
        multisigAccountsInfo: data.accountsMultisigInfo,
        mosaic: data.xpxFound,
        isMultiSig: data.isMultiSign,
        balance: data.balance
      }
    },
    buildSwapTransaction (data, amount, signerPvk) {
      const account = this.createAccountFromPrivateKey(signerPvk)
      const assetId = data.mosaic.assetId
      console.log('assetId', assetId)
      console.log('account', account)
    },
    createAddressToString (address) {
      return new Address(address)
    },
    createAccountFromPrivateKey (privateKey) {
      return Account.createWithPrivateKey(privateKey)
    },
    createPublicAccountFromPublicKey (publicKey) {
      return PublicAccount.createWithPublicKey(publicKey)
    },
    getAccountInfo (address) {
      const configNIS1 = this.$store.getters['swapStore/configNIS1']
      const url = `${configNIS1.url}/account/get?address=${address.plain()}`
      return axios.get(url, { timeout: configNIS1.timeOutTransaction })
    },
    getConfigFromNetworkNis1 (nis1Network) {
      let config = null
      switch (nis1Network) {
        case NetworkTypes.TEST_NET:
          config = this.$configInfo.data.environment.PUBLICTEST
          break
        case NetworkTypes.MAIN_NET:
          config = this.$configInfo.data.environment.MAINNET
          break
      }
      return config
    },
    getOwnedMosaics (address) {
      const environment = this.$store.getters['swapStore/environment']
      const accountOwnedMosaics = new AccountOwnedAssetService(environment.accountHttp, environment.assetHttp)
      return this.$generalService.promiseTimeOut(accountOwnedMosaics.fromAddress(address), environment.configNIS1.timeOutTransaction)
    },
    getUnconfirmedTransaction (address) {
      const accountHttp = this.$store.getters['swapStore/accountHttp']
      return accountHttp.unconfirmedTransactions(address).toPromise()
    },
    getSwapInfo (publicKey) {
      let status = false
      let mosaicInfoOwnedSwap = null
      const promise = new Promise(async (resolve, reject) => {
        try {
          const publicAccount = this.createPublicAccountFromPublicKey(publicKey)
          const addressOwnedSwap = this.createAddressToString(publicAccount.address.pretty())
          const accountInfoOwnedSwap = await this.getAccountInfo(addressOwnedSwap)
          if (accountInfoOwnedSwap.data.meta.cosignatories.length === 0) {
            // INFO ACCOUNTS MULTISIG
            let cosignatoryOf = []
            let accountsMultisigInfo = []
            const response = await this.searchInfoAccountMultisig(accountInfoOwnedSwap, cosignatoryOf, accountsMultisigInfo)
            cosignatoryOf = response.cosignatoryOf
            accountsMultisigInfo = response.accountsMultisigInfo
            mosaicInfoOwnedSwap = await this.searchMosaicInfoOwnedSwap(addressOwnedSwap, publicAccount, accountsMultisigInfo, cosignatoryOf)
            status = false
            if (mosaicInfoOwnedSwap) {
              status = true
            }
          } else {
            status = false
            this.$store.commit('SHOW_SNACKBAR', {
              snackbar: true,
              text: 'Swap does not support this account type',
              color: 'error'
            })
          }
        } catch (error) {
          status = false
          this.$store.commit('SHOW_SNACKBAR', {
            snackbar: true,
            text: 'It was not possible to connect to the server, try later',
            color: 'error'
          })
        }

        resolve({ status, mosaicInfoOwnedSwap })
      })

      return promise
    },
    initConfigSwap (catapultNetwork) {
      const catapultNetworkTypes = this.$blockchainProvider.getNetworkTypes()
      switch (catapultNetwork) {
        case catapultNetworkTypes.testnet.value:
          this.setSwapEnvironment(NetworkTypes.TEST_NET)
          break
        case catapultNetworkTypes.mainnet.value:
          this.setSwapEnvironment(NetworkTypes.MAIN_NET)
          break
      }
    },
    setSwapEnvironment (network) {
      const data = {
        networkNis1: network,
        configNIS1: this.getConfigFromNetworkNis1(network).nis1Config
      }

      this.$store.commit('swapStore/INIT_ENVIRONMENT_SWAP', data)
    }
  }
}
