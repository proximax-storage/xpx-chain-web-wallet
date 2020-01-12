export default {
  methods: {
    createWallet (data) {
      const existWallet = this.getWalletByName(data.walletName, data.network)
      if (existWallet === undefined || existWallet === null) {
        let walletCreated = null
        let prefix = null
        if (data.privateKey) {
          const prefixAndPvk = this.$blockchainProvider.getPrefixAndPrivateKey(data.privateKey)
          prefix = prefixAndPvk.pref
          walletCreated = this.$blockchainProvider.createSimpleWalletFromPrivateKey(data.walletName, data.password, prefixAndPvk.pvk, data.network)
        } else {
          walletCreated = this.$blockchainProvider.createSimpleWallet(data.walletName, data.password, data.network)
        }

        const decrypted = this.decrypt(walletCreated, data.password)
        if (decrypted.privateKey) {
          const account = this.$blockchainProvider.getAccountFromPrivateKey(decrypted.privateKey, walletCreated.network)
          const accountBuilded = {
            algo: 'pass:bip32',
            address: walletCreated.address,
            brain: true,
            creationDate: walletCreated.creationDate,
            default: data.default,
            encryptedPrivateKey: walletCreated.encryptedPrivateKey,
            firstAccount: data.firstAccount,
            isMultisign: data.isMultisign,
            name: 'Primary',
            network: walletCreated.network,
            nis1Account: data.nis1Account,
            prefixKeyNis1: prefix,
            publicKey: account.publicAccount.publicKey,
            schema: walletCreated.schema
          }

          const walletBuilded = {
            name: data.walletName,
            accounts: [accountBuilded]
          }

          const wallets = this.getWallets(walletCreated.network)
          wallets.push(walletBuilded)
          this.$storage.set(`wallets-${walletCreated.network}`, wallets)
          this.$store.commit('walletStore/SET_CURRENT_WALLET', walletBuilded)
          return { status: true, data: walletBuilded, pvk: decrypted.privateKey }
        }

        return { status: false, msg: 'Error to decrypt wallet' }
      }

      return { status: false, msg: 'Wallet name already exists, try another name' }
    },
    decrypt (account, password) {
      const common = { password: password }
      const toDecrypt = {
        algo: 'pass:bip32',
        address: account.address['address'],
        encrypted: account.encryptedPrivateKey.encryptedKey,
        iv: account.encryptedPrivateKey.iv
      }

      const decrypt = this.$blockchainProvider.decrypt(common, toDecrypt, account.network)
      if (decrypt && decrypt.status) {
        return common
      }

      return decrypt
    },
    getWalletByName (name, network) {
      const wallets = this.getWallets(network)
      if (wallets && wallets.length > 0) {
        return wallets.find(x => x.name === name)
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

      return []
    }
  }
}
