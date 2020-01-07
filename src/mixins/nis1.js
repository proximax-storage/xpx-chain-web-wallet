import axios from 'axios'
import { Account, AccountHttp, AccountOwnedAssetService, Address, AssetHttp, NEMLibrary, NetworkTypes, PublicAccount } from 'nem-library'

export default {
  data: () => {
    return {
      configNIS1: null,
      accountHttp: null,
      assetHttp: null
    }
  },
  methods: {
    async validateBalanceAccounts (xpxFound, addressSigner) {
      const quantityFillZeros = this.$blockchainProvider.addZeros(6, xpxFound.quantity)
      let realQuantity = this.$blockchainProvider.amountFormatter(quantityFillZeros, xpxFound, 6)
      const unconfirmedTxn = await this.getUnconfirmedTransaction(addressSigner)
      if (unconfirmedTxn.length > 0) {
        for (const item of unconfirmedTxn) {
          let existMosaic = null
          if (item.type === 257 && item['signer']['address']['value'] === addressSigner['value'] && item['_assets'].length > 0) {
            existMosaic = item['_assets'].find((mosaic) => mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx')
          } else if (item.type === 4100 && item['otherTransaction']['type'] === 257 && item['otherTransaction']['signer']['address']['value'] === addressSigner['value']) {
            existMosaic = item['otherTransaction']['_assets'].find((mosaic) => mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx')
          }

          if (existMosaic) {
            const unconfirmedFormatter = parseFloat(this.$blockchainProvider.amountFormatter(existMosaic.quantity, xpxFound, 6))
            const quantityWhitoutFormat = realQuantity.split(',').join('')
            const residue = this.transactionService.subtractAmount(parseFloat(quantityWhitoutFormat), unconfirmedFormatter)
            const quantityFormat = this.$blockchainProvider.amountFormatter(parseInt((residue).toString().split('.').join('')), xpxFound, 6)
            realQuantity = quantityFormat
          }
        }

        return realQuantity
      } else {
        return realQuantity
      }
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
      const promise = new Promise(async (resolve, reject) => {
        try {
          let cosignatoryOf = []
          let accountsMultisigInfo = []
          const addressOwnedSwap = this.createAddressToString(publicAccount.address.pretty())
          const accountInfoOwnedSwap = await this.getAccountInfo(addressOwnedSwap)
          if (accountInfoOwnedSwap.data.meta.cosignatories.length === 0) {
            // INFO ACCOUNTS MULTISIG
            if (accountInfoOwnedSwap.data.meta.cosignatoryOf.length > 0) {
              cosignatoryOf = accountInfoOwnedSwap.meta.cosignatoryOf
              for (let multisig of cosignatoryOf) {
                try {
                  const addressMultisig = this.createAddressToString(multisig.address)
                  const ownedMosaic = await this.getOwnedMosaics(addressMultisig).toPromise()
                  const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx')
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

            let nis1AccountsInfo = null
            try {
              // SEARCH INFO OWNED SWAP
              const ownedMosaic = await this.getOwnedMosaics(addressOwnedSwap).toPromise()
              const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx')
              if (xpxFound) {
                const balance = await this.validateBalanceAccounts(xpxFound, addressOwnedSwap)
                const params = { publicAccount, accountsMultisigInfo, balance, cosignersAccounts: cosignatoryOf, isMultiSign: false, name, xpxFound }
                nis1AccountsInfo = this.buildAccountInfoNIS1(params)
                console.log('nis1AccountsInfo ---->', nis1AccountsInfo)
                // this.setNis1AccountsFound$(nis1AccountsInfo)
              } else if (cosignatoryOf.length > 0) {
                const params = { publicAccount, accountsMultisigInfo, balance: null, cosignersAccounts: cosignatoryOf, isMultiSign: false, name, xpxFound: null }
                nis1AccountsInfo = this.buildAccountInfoNIS1(params)
                console.log('nis1AccountsInfo ---->', nis1AccountsInfo)
                // this.setNis1AccountsFound$(nis1AccountsInfo)
              } else {
                console.log('The account has no balance to swap.')
                // this.setNis1AccountsFound$(null)
                this.$store.commit('SHOW_SNACKBAR', {
                  snackbar: true,
                  text: 'The account has no balance to swap',
                  color: 'warning'
                })
              }
            } catch (error) {
              console.log(error)
              // this.setNis1AccountsFound$(null)
              this.$store.commit('SHOW_SNACKBAR', {
                snackbar: true,
                text: 'It was not possible to connect to the server, try later',
                color: 'error'
              })
            }
          } else {
            this.$store.commit('SHOW_SNACKBAR', {
              snackbar: true,
              text: 'Swap does not support this account type',
              color: 'error'
            })
          }
          resolve({ status: false })
        } catch (error) {
          this.$store.commit('SHOW_SNACKBAR', {
            snackbar: true,
            text: 'It was not possible to connect to the server, try later',
            color: 'error'
          })
          resolve({ status: false })
        }
      })

      return promise
    },
    getAccountInfo (address) {
      this.configNIS1 = this.getConfigFromNetworkNis1(NEMLibrary.getNetworkType())
      const url = `${this.configNIS1.nis1Config.url}/account/get?address=${address.plain()}`
      return axios.get(url)
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

      console.log('retornando aqui', config)
      return config
    },
    getOwnedMosaics (address) {
      this.accountHttp = new AccountHttp(this.nodes)
      this.assetHttp = new AssetHttp(this.nodes)
      const accountOwnedMosaics = new AccountOwnedAssetService(this.accountHttp, this.assetHttp)
      console.log('accountOwnedMosaics', accountOwnedMosaics)
      return accountOwnedMosaics.fromAddress(address)
    },
    getUnconfirmedTransaction (address) {
      return this.accountHttp.unconfirmedTransactions(address).toPromise()
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
