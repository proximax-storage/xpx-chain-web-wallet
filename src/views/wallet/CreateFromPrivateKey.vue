<template>
  <div>
    <template v-if="!dataWalletCreated">
      <v-form v-model="valid" ref="form">
        <v-container>
          <v-row>
           <v-col cols="11" sm="10" class="mx-auto">
              <!-- Title & Subtitle -->
              <title-subtitle :title="title" :subtitle="sub" :separed1="true"></title-subtitle>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="11" sm="8" md="7" lg="6" class="mx-auto">
              <v-row>
                <!-- Type network -->
                <v-col cols="12">
                  <v-autocomplete
                    rounded
                    outlined
                    dense
                    v-model="networkSelected"
                    :items="networksType"
                    item-text="text"
                    item-value="value"
                    label="Network type"
                    return-object
                    cache-items
                    auto-select-first
                  ></v-autocomplete>
                </v-col>

                <!-- Private Key -->
                <v-col cols="12">
                  <v-text-field
                    rounded
                    outlined
                    dense
                    v-model="privateKey"
                    :append-icon="configForm.privateKey.show ? 'mdi-eye' : 'mdi-eye-off'"
                    :minlength="configForm.privateKey.min"
                    :maxlength="configForm.privateKey.max"
                    :counter="configForm.privateKey.max"
                    :rules="[
                      configForm.privateKey.rules.required,
                      configForm.privateKey.rules.min,
                      configForm.privateKey.rules.max,
                      configForm.privateKey.rules.isHex
                    ]"
                    :label="configForm.privateKey.label"
                    :type="configForm.privateKey.show ? 'text' : 'password'"
                    name="privateKey"
                    hint
                    @click:append="configForm.privateKey.show = !configForm.privateKey.show"
                  >
                    <template v-slot:prepend-inner>
                      <v-img
                        class="pr-2 mt-1"
                        alt="logo"
                        height="20"
                        width="20"
                        :src="require(`@/assets/img/${configForm.privateKey.icon}`)"
                      ></v-img>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Is Swap Checkbox -->
                <v-col cols="12" class="d-flex justify-center pt-0">
                  <v-checkbox v-model="isSwap" :label="`Check this box if you wish to swap with this private key.`"></v-checkbox>
                </v-col>

                <!-- Wallet name -->
                <v-col cols="12 pt-0 pb-0">
                  <v-text-field
                    :label="configForm.walletName.label"
                    :loading="searchingWalletName"
                    :disabled="searchingWalletName"
                    :minlength="configForm.walletName.min"
                    :maxlength="configForm.walletName.max"
                    :counter="configForm.walletName.max"
                    :rules="[
                      configForm.walletName.rules.required,
                      configForm.walletName.rules.min,
                      configForm.walletName.rules.max,
                      walletIsRepeat
                    ]"
                    rounded
                    outlined
                    dense
                    v-model.trim="walletName"
                  >
                    <template v-slot:prepend-inner>
                      <v-img
                        class="pr-2 mt-1"
                        alt="logo"
                        height="20"
                        width="20"
                        :src="require(`@/assets/img/${configForm.walletName.icon}`)"
                      ></v-img>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Password -->
                <v-col cols="12" md="6">
                  <v-text-field
                    rounded
                    outlined
                    dense
                    v-model="passwords.password"
                    :append-icon="configForm.password.show ? 'mdi-eye' : 'mdi-eye-off'"
                    :minlength="configForm.password.min"
                    :maxlength="configForm.password.max"
                    :counter="configForm.password.max"
                    :rules="[
                    configForm.password.rules.required,
                    configForm.password.rules.min,
                    configForm.password.rules.max
                  ]"
                    :label="configForm.password.label"
                    :type="configForm.password.show ? 'text' : 'password'"
                    name="password"
                    hint
                    @click:append="configForm.password.show = !configForm.password.show"
                  >
                    <template v-slot:prepend-inner>
                      <v-img
                        class="pr-2 mt-1"
                        alt="logo"
                        height="20"
                        width="20"
                        :src="require(`@/assets/img/${configForm.password.icon}`)"
                      ></v-img>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Confirm Password -->
                <v-col cols="12" md="6">
                  <v-text-field
                    rounded
                    outlined
                    dense
                    name="confirmPassword"
                    label="Confirm Password"
                    hint="Confirm Password"
                    v-model="passwords.confirmPassword"
                    :append-icon="configForm.password.showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                    :minlength="configForm.password.min"
                    :maxlength="configForm.password.max"
                    :counter="configForm.password.max"
                    :rules="[
                    configForm.password.rules.required,
                    configForm.password.rules.min,
                    configForm.password.rules.max,
                    isMatch(passwords.password, passwords.confirmPassword, 'Password')
                  ]"
                    :type="configForm.password.showConfirm ? 'text' : 'password'"
                    :disabled="disabledConfirmPassword"
                    @click:append="configForm.password.showConfirm = !configForm.password.showConfirm"
                  >
                    <template v-slot:prepend-inner>
                      <v-img
                        class="pr-2 mt-1"
                        alt="logo"
                        height="20"
                        width="20"
                        :src="require(`@/assets/img/${configForm.password.icon}`)"
                      ></v-img>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>

              <!-- Buttons -->
              <custom-buttons @action="action" :arrayBtn="getArrayBtn"></custom-buttons>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </template>

    <template v-if="dataWalletCreated">
      <wallet-created :data="dataWalletCreated"></wallet-created>
    </template>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import generalMixins from '../../mixins/general'
import walletMixins from '../../mixins/wallet'

export default {
  mixins: [generalMixins, walletMixins],
  data: () => {
    return {
      title: 'Create Wallet',
      sub:
        'Restore your existing ProximaX Sirius Wallet, import a private key from another service or create a new wallet right now!',
      dataWalletCreated: null,
      valid: false,
      sendingForm: false,
      configForm: null,
      networksType: [],
      networkSelected: { text: '', value: '' },
      walletName: '',
      privateKey: '',
      passwords: { password: '', confirmPassword: '' },
      searchingWalletName: false,
      walletIsRepeat: false,
      isSwap: false,
      arrayBtn: null
    }
  },
  components: {
    'title-subtitle': () => import('@/components/shared/Title'),
    'custom-buttons': () => import('@/components/shared/Buttons'),
    'wallet-created': () => import('@/components/wallet/WalletCreated')
  },
  methods: {
    ...mapMutations(['SHOW_SNACKBAR', 'SHOW_LOADING']),
    action (action) {
      if (action === 'create') {
        this.sendForm()
      } else {
        this.clear()
      }
    },
    clear () {
      this.walletIsRepeat = false
      this.searchingWalletName = false
      this.sendingForm = false
      this.$refs.form.reset()
      const network = this.networksType.find(x => x.value === 168)
      this.networkSelected = { text: network.text, value: network.value }
    },
    sendForm () {
      if (this.valid && !this.sendingForm) {
        this.sendingForm = true
        this.SHOW_LOADING(true)
        const response = this.createWallet({
          default: true,
          firstAccount: true,
          isMultisign: null,
          nis1Account: this.isSwap,
          walletName: this.walletName,
          network: this.networkSelected.value,
          password: this.passwords.password,
          privateKey: this.privateKey
        })

        console.log('response --->', response)
        setTimeout(() => {
          this.clear()
          this.sendingForm = false
          this.SHOW_LOADING(false)
          if (response.status) {
            this.dataWalletCreated = response
          }
        }, 500)
      }
    },
    resetConfirmPassword () {
      this.passwords.confirmPassword = ''
    },
    validateWalletName () {
      const usr = this.walletName
      if (usr && usr !== '' && usr.length >= this.configForm.walletName.min) {
        this.searchingWalletName = true
        setTimeout(() => {
          if (this.getWalletByName(usr, this.networkSelected.value)) {
            this.searchingWalletName = false
            this.walletIsRepeat = `${usr} already exists, try another wallet name.`
            return
          }

          this.walletIsRepeat = false
          this.searchingWalletName = false
        }, 500)
      }
    }
  },
  computed: {
    disabledConfirmPassword () {
      const password = this.passwords.password
      if (password) {
        if (password === '' || password.length < this.configForm.password.min) {
          this.resetConfirmPassword()
          return true
        }
        return false
      } else {
        return true
      }
    },
    getArrayBtn () {
      const arrayBtn = this.arrayBtn
      arrayBtn['clear'].disabled = this.sendingForm
      arrayBtn['create'].disabled =
        !this.valid || this.sendingForm || this.searchingWalletName
      arrayBtn['create'].loading = this.sendingForm
      return arrayBtn
    }
  },
  watch: {
    walletName (newVal) {
      this.debouncedValidateWalletName()
    }
  },
  beforeMount () {
    this.configForm = this.getConfigForm()
    this.debouncedValidateWalletName = this.lodash.debounce(
      this.validateWalletName,
      500
    )

    this.networksType = this.$blockchainProvider.getNetworkTypes()
    this.networkSelected = this.networksType[0]
    this.arrayBtn = {
      clear: this.typeButtons().clear,
      create: this.typeButtons().create
    }
  }
}
</script>
