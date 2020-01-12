import axios from 'axios'
import * as JsJoda from 'js-joda'
import { Account, AccountOwnedAssetService, Address, NetworkTypes, PublicAccount, PlainMessage, TransferTransaction, TimeWindow } from 'nem-library'

export default {
  methods: {
    async createTransaction (message, assetId, quantity, env) {
      const resultAssets = await env.assetHttp.getAssetTransferableWithAbsoluteAmount(assetId, quantity).toPromise()
      const part = quantity.toString().split('.')
      const cant = (part.length === 1) ? 6 : 6 - part[1].length
      for (let index = 0; index < cant; index++) {
        if (part.length === 1) {
          part[0] += 0
        } else {
          part[1] += 0
        }
      }

      resultAssets['quantity'] = Number(part.join(''))
      return TransferTransaction.createWithAssets(
        this.createWithDeadline(),
        new Address(env.configNIS1.burnAddress),
        [resultAssets],
        message
      )
    },
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
            const residue = this.$generalService.subtractAmount(parseFloat(quantityWhitoutFormat), unconfirmedFormatter)
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
    async searchMosaicInfoOwnedSwap (addressOwnedSwap, publicAccount, accountsMultisigInfo, cosignatoryOf, accountName, walletName) {
      let nis1AccountsInfo = null
      try {
        // SEARCH INFO OWNED SWAP
        const namespace = this.$store.getters['swapStore/namespace']
        const ownedMosaic = await this.getOwnedMosaics(addressOwnedSwap)
        const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === namespace.root && el.assetId.name === namespace.sub)
        if (xpxFound) {
          const balance = await this.validateBalanceAccounts(xpxFound, addressOwnedSwap)
          const params = { publicAccount, accountsMultisigInfo, balance, cosignersAccounts: cosignatoryOf, isMultiSign: false, name, xpxFound }
          nis1AccountsInfo = this.buildAccountInfoNIS1(params, accountName, walletName)
        } else if (cosignatoryOf.length > 0) {
          const params = { publicAccount, accountsMultisigInfo, balance: null, cosignersAccounts: cosignatoryOf, isMultiSign: false, name, xpxFound: null }
          nis1AccountsInfo = this.buildAccountInfoNIS1(params, accountName, walletName)
        } else {
          this.$store.commit('SHOW_SNACKBAR', {
            snackbar: true,
            text: 'The account has no balance to swap',
            color: 'warning'
          })
        }
      } catch (error) {
        this.$store.commit('SHOW_SNACKBAR', {
          snackbar: true,
          text: 'It was not possible to connect to the server, try later',
          color: 'error'
        })
      }

      return nis1AccountsInfo
    },
    async swap (param) {
      console.log(param)
      const promise = new Promise(async (resolve, reject) => {
        try {
          let quantity = null
          try {
            quantity = parseFloat(param.amount.split(',').join(''))
          } catch (error) {
            quantity = Number(param.amount)
          }

          const env = this.$store.getters['swapStore/environment']
          const nis1Account = this.createAccountFromPrivateKey(param.privateKey)
          const assetId = param.nis1AccountData.mosaic.assetId
          const msg = PlainMessage.create(param.catapultAccount.publicKey)
          const transaction = await this.createTransaction(msg, assetId, quantity, env)
          const signedTransaction = nis1Account.signTransaction(transaction)
          const url = `${env.configNIS1.url}/transaction/announce`
          axios.post(url, signedTransaction, { timeout: env.configNIS1.timeOutTransaction }).then(next => {
            if (next.data && next.data['message'] && next.data['message'].toLowerCase() === 'success') {
              const data = {
                catapultAccount: param.catapultAccount,
                transaction,
                hash: next.data['transactionHash'].data,
                walletName: param.walletName
              }

              this.$store.dispatch('showMSG', {
                snackbar: true,
                text: `Swap in process`,
                color: 'success'
              })

              const certified = this.saveCertifiedSwap(data)
              resolve({ status: true, certified })
            } else {
              this.validateCodeMsgError(next.data['code'], next.data['message'])
              resolve({ status: false })
            }
          }).catch(error => {
            this.validateCodeMsgError(error.error.code, error.error.message)
            resolve({ status: false })
          })
        } catch (error) {
          resolve({ status: false })
        }
      })

      return promise
    },
    buildAccountInfoNIS1 (data, accountName, walletName) {
      let cosignatoryOf = false
      if (data.cosignersAccounts.length > 0) {
        cosignatoryOf = true
      }

      return {
        address: data.publicAccount.address,
        publicKey: data.publicAccount.publicKey,
        cosignerOf: cosignatoryOf,
        cosignerAccounts: data.cosignersAccounts,
        multisigAccountsInfo: data.accountsMultisigInfo,
        mosaic: data.xpxFound,
        nameAccount: accountName,
        nameWallet: walletName,
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
    createWithDeadline (deadline = 2, chronoUnit = JsJoda.ChronoUnit.HOURS) {
      const currentTimeStamp = (new Date()).getTime() - 600000
      const timeStampDateTime = JsJoda.LocalDateTime.ofInstant(JsJoda.Instant.ofEpochMilli(currentTimeStamp), JsJoda.ZoneId.SYSTEM)
      const deadlineDateTime = timeStampDateTime.plus(deadline, chronoUnit)
      if (deadline <= 0) {
        throw new Error('deadline should be greater than 0')
      } else if (timeStampDateTime.plus(24, JsJoda.ChronoUnit.HOURS).compareTo(deadlineDateTime) !== 1) {
        throw new Error('deadline should be less than 24 hours')
      }
      return new TimeWindow(timeStampDateTime, deadlineDateTime)
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
    getTimeStampTimeWindow (transaction) {
      const year = transaction.timeWindow.timeStamp['_date']['_year']
      const month = transaction.timeWindow.timeStamp['_date']['_month']
      const day = transaction.timeWindow.timeStamp['_date']['_day']
      const hour = transaction.timeWindow.timeStamp['_time']['_hour']
      const minutes = transaction.timeWindow.timeStamp['_time']['_minute']
      const seconds = transaction.timeWindow.timeStamp['_time']['_second']
      return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
    },
    getCertifiedSwap (catapultNetwork) {
      if (catapultNetwork) {
        const certifiedSwap = this.$storage.get(`certified-swap-${catapultNetwork}`)
        if (!certifiedSwap) {
          this.$storage.set(`certified-swap-${catapultNetwork}`, [])
          return []
        }

        return JSON.parse(certifiedSwap)
      }

      return []
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
    },
    searchSwapInfo (publicKey, accountName, walletName) {
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
            mosaicInfoOwnedSwap = await this.searchMosaicInfoOwnedSwap(addressOwnedSwap, publicAccount, accountsMultisigInfo, cosignatoryOf, accountName, walletName)
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
    saveCertifiedSwap (data) {
      const catapultPublicAccount = this.$blockchainProvider.createPublicAccount(data.catapultAccount.publicKey, data.catapultAccount.network)
      const transactionNis1 = {
        siriusAddres: catapultPublicAccount.address.pretty(),
        nis1Timestamp: this.getTimeStampTimeWindow(data.transaction),
        nis1PublicKey: data.transaction.signer.publicKey,
        nis1TransactionHash: data.hash
      }

      const allCertified = this.getCertifiedSwap(data.catapultAccount.network)
      let othersCertifiedSwap = allCertified.filter(b => b.name !== data.walletName)
      let currentCertified = null
      if (allCertified.length > 0) {
        currentCertified = allCertified.find(b => b.name === data.walletName)
        if (currentCertified && currentCertified.transactions) {
          currentCertified.transactions.push(transactionNis1)
        } else {
          currentCertified = { name: data.walletName, transactions: [transactionNis1] }
        }
      } else {
        currentCertified = { name: data.walletName, transactions: [transactionNis1] }
      }

      othersCertifiedSwap.push(currentCertified)
      this.$storage.set(`txn-nis1-${data.catapultAccount.network}`, othersCertifiedSwap)
      return transactionNis1
    },
    validateCodeMsgError (errorCode, errorMessage) {
      switch (errorCode) {
        case 521:
        case 535:
        case 542:
        case 551:
        case 565:
        case 582:
        case 610:
        case 622:
        case 672:
        case 711:
          this.$store.dispatch('showMSG', {
            snackbar: true,
            text: `Some data is invalid`,
            color: 'error'
          })
          break

        case 591:
          this.$store.dispatch('showMSG', {
            snackbar: true,
            text: `Invalid Timestamp`,
            color: 'error'
          })
          break

        case 501:
        case 635:
        case 641:
        case 685:
        case 691:
          this.$store.dispatch('showMSG', {
            snackbar: true,
            text: `Service not available`,
            color: 'error'
          })
          break

        case 655:
        case 666:
          this.$store.dispatch('showMSG', {
            snackbar: true,
            text: `Insufficient XPX Balance`,
            color: 'error'
          })
          break

        case 511:
          this.$store.dispatch('showMSG', {
            snackbar: true,
            text: `Daily limit exceeded (5 swaps)`,
            color: 'error'
          })
          break

        case 705:
          this.$store.dispatch('showMSG', {
            snackbar: true,
            text: `Invalid Url`,
            color: 'error'
          })
          break

        case 722:
        case 822:
          this.$store.dispatch('showMSG', {
            snackbar: true,
            text: `Account not allowed`,
            color: 'error'
          })
          break

        case 541:
          this.$store.dispatch('showMSG', {
            snackbar: true,
            text: `Account not allowed`,
            color: 'error'
          })
          break

        default:
          if (errorMessage) {
            this.$store.dispatch('showMSG', {
              snackbar: true,
              text: errorMessage.toString().split('_').join(' '),
              color: 'error'
            })
          } else {
            this.$store.dispatch('showMSG', {
              snackbar: true,
              text: `Error! try again later`,
              color: 'error'
            })
          }
          break
      }
    }
  }
}
