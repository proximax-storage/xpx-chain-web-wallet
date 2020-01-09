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

        const decrypted = this.decryptWallet(walletCreated, data.password)
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

          console.log('\n accountBuilded', accountBuilded)
          const walletBuilded = {
            name: data.walletName,
            accounts: [accountBuilded]
          }

          console.log('\n walletBuilded', walletBuilded)
          const wallets = this.getWallets(walletCreated.network)
          wallets.push(walletBuilded)
          this.$storage.set(`wallets-${walletCreated.network}`, wallets)
          return { status: true, data: walletBuilded, pvk: decrypted.privateKey }
        }

        return { status: false, msg: 'Error to decrypt wallet' }
      }

      return { status: false, msg: 'Wallet name already exists, try another name' }
    },
    decryptWallet (catapulWallet, password) {
      const common = { password: password }
      const account = {
        algo: 'pass:bip32',
        address: catapulWallet.address['address'],
        encrypted: catapulWallet.encryptedPrivateKey.encryptedKey,
        iv: catapulWallet.encryptedPrivateKey.iv
      }

      const decrypt = this.$blockchainProvider.decrypt(common, account, catapulWallet.network)
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
    }
  }
}
