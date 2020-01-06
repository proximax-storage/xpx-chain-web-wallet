export default {
  methods: {
    createWallet (data) {
      const existWallet = this.getWalletByName(data.walletName, data.network)
      console.log(existWallet)
      if (existWallet === undefined || existWallet === null) {
        let walletCreated = null
        if (data.privateKey) {
          walletCreated = this.$blockchainProvider.createSimpleWalletFromPrivateKey(data.walletName, data.password, data.privateKey, data.network)
        } else {
          walletCreated = this.$blockchainProvider.createSimpleWallet(data.walletName, data.password, data.network)
        }

        const decrypted = this.decryptWallet(walletCreated, data.password)
        if (decrypted.privateKey) {
          const publicAccount = this.$blockchainProvider.getAccountFromPrivateKey(decrypted.privateKey, walletCreated.network).publicAccount
          const accountBuilded = {
            algo: 'pass:bip32',
            brain: true,
            default: data.default,
            firstAccount: data.firstAccount,
            isMultisign: data.isMultisign,
            nis1Account: data.nis1Account,
            publicAccount: publicAccount,
            prefixKeyNis1: data.prefixKeyNis1,
            simpleWallet: walletCreated
          }

          const wallets = this.getWallets(walletCreated.network)
          wallets.push(accountBuilded)
          this.$storage.set(`wallets-${walletCreated.network}`, wallets)
          return { status: true, data: accountBuilded, pvk: decrypted.privateKey }
        }

        return { status: false, msg: 'Error to decrypt wallet' }
      }

      return { status: false, msg: 'Wallet name already exists, try another name' }
    },

    decryptWallet (simpleWallet, password) {
      const common = { password: password }
      const account = {
        algo: 'pass:bip32',
        address: simpleWallet.address['address'],
        encrypted: simpleWallet.encryptedPrivateKey.encryptedKey,
        iv: simpleWallet.encryptedPrivateKey.iv
      }

      const decrypt = this.$blockchainProvider.decrypt(common, account, simpleWallet.network)
      if (decrypt && decrypt.status) {
        return common
      }

      return decrypt
    },

    getWalletByName (name, network) {
      const wallets = this.getWallets(network)
      if (wallets && wallets.length > 0) {
        return wallets.find(x => x.simpleWallet.name === name)
      }

      return null
    },

    getWallets (network) {
      if (network) {
        const wallets = this.$storage.get(`wallets-${network}`)
        if (!wallets) {
          this.$storage.set(`wallets-${network}`, [])
          return []
        }

        return JSON.parse(wallets)
      }
    }
  }
}
