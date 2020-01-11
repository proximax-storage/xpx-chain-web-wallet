
<template>
  <v-container class="pt-0">
    <template v-if="certified === null">
      <v-row>
        <v-col cols="12" sm="10" class="mx-auto pt-0">
          <!-- Title & Subtitle -->
          <v-row>
            <v-col cols="11" class="mx-auto pt-0">
              <custom-breadcrumbs :items="breadcrumbsItems" :divider="'>'"></custom-breadcrumbs>
            </v-col>
          </v-row>

          <!-- Title 1 -->
          <v-row>
            <v-col cols="12" class="text-center pt-0">
              <span class="font-weight-regular title">{{swapTitle}}</span>
            </v-col>
          </v-row>

          <!-- Address, balance, account name -->
          <v-row>
            <v-col cols="11" md="10" lg="9" class="box-gray mb-3 mx-auto">
              <v-row>
                <v-col cols="12" class="ml-0 pt-0 pb-0 overflow-ellipsis-nowrap mx-auto">
                  <!-- Name Account -->
                  <span class="body-1 font-weight-medium pr-1">Account Name:</span>
                  <span class="body-2">{{dataAccountToSwap.nameAccount}}</span>
                  <br />
                  <!-- NIS1 Address -->
                  <span class="body-1 font-weight-medium pr-1">NIS1 Address:</span>
                  <span class="body-2">{{dataAccountToSwap.address.pretty()}}</span>
                  <br />
                  <!-- NIS1 Balance -->
                  <div class="d-flex align-center">
                    <span class="body-1 font-weight-medium pr-1">NIS1 Balance:</span>
                    <img
                      class="ml-1 mr-1"
                      alt="logo"
                      width="20"
                      :src="require(`@/assets/img/icon-prx-xpx-green-16h-proximax-sirius-wallet.svg`)"
                    />
                    <span class="body-2">{{dataAccountToSwap.balance}}</span>
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Title 2 -->
          <v-row>
            <v-col cols="12" class="text-center pt-5">
              <span class="font-weight-regular title">{{swapTitle2}}</span>
            </v-col>
          </v-row>

          <!-- Form -->
          <v-form v-model="valid" ref="form">
            <v-row>
              <!-- Amount -->
              <v-col cols="11" md="10" lg="9" class="mx-auto">
                <v-text-field
                  :label="configForm.amount.label"
                  :minlength="'1'"
                  :maxlength="dataAccountToSwap.balance.length"
                  :rules="[
                    configForm.amount.rules.required,
                    isValidBalance
                  ]"
                  @keyup="validateBalance"
                  class="text-align-right"
                  rounded
                  outlined
                  dense
                  ref="amount"
                  id="amount"
                  v-model="amount"
                  v-money="money"
                >
                  <template v-slot:prepend-inner>
                    <v-img
                      class="pr-2 mt-1"
                      alt="logo"
                      height="20"
                      width="20"
                      :src="require(`@/assets/img/${configForm.amount.icon}`)"
                    ></v-img>
                    <div class="d-flex align-center ml-2 cursor-pointer" @click="selectMaxAmount">
                      <span class="caption font-weight-medium primary--text cursor-p pt-1">Use Max</span>
                    </div>
                  </template>
                </v-text-field>
              </v-col>

              <!-- Password -->
              <v-col cols="11" md="10" lg="9" class="mx-auto">
                <v-text-field
                  rounded
                  outlined
                  dense
                  v-model="password"
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
            </v-row>
          </v-form>

          <!-- Warning Message -->
          <v-row>
            <v-col cols="11" md="10" lg="9" class="mx-auto">
              <v-alert outlined type="warning" prominent class="text-center line-h-1-02em" dense>
                <span class="gray-black--text caption">{{warningText}}</span>
              </v-alert>
            </v-col>
          </v-row>

          <!-- Buttons -->
          <custom-buttons @action="action" :arrayBtn="buttons"></custom-buttons>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <swap-certified :certified="certified"></swap-certified>
    </template>
  </v-container>
</template>

<script>
import { mapMutations } from 'vuex'
import walletMixin from '../../mixins/wallet-mixin'
import generalMixin from '../../mixins/general-mixin'
import swapMixin from '../../mixins/swap-mixin'

export default {
  mixins: [generalMixin, swapMixin, walletMixin],
  data: () => {
    return {
      amount: '',
      arrayBtn: {
        cancel: {
          key: 'cancel',
          action: 'cancel',
          disabled: false,
          color: 'primary',
          loading: false,
          text: 'Maybe Later'
        },
        continue: {
          key: 'continue',
          action: 'continue',
          disabled: true,
          color: 'primary',
          loading: false,
          text: 'Yes, Swap'
        }
      },
      breadcrumbsItems: [
        {
          text: 'Mainnet Swap',
          disabled: true,
          style: 'gray-disabled--text'
        },
        {
          text: 'Swap Process',
          disabled: false,
          style: 'primary--text'
        }
      ],
      certified: null,
      configForm: null,
      dataAccountToSwap: null,
      isValidBalance: false,
      money: {
        decimal: '.',
        thousands: ',',
        prefix: '',
        suffix: '',
        precision: 6,
        masked: false
      },
      password: '',
      sendingForm: false,
      swapData: null,
      swapTitle: 'NIS1 Account Selected',
      swapTitle2: 'Swap Amount',
      valid: false,
      warningText:
        'Swap process may take several hours to complete. If you wish to proceed, you will receive a certificate containing your transaction hash for your records.'
    }
  },
  beforeMount () {
    this.swapData = this.$store.getters['swapStore/swapData']
    const addressToSwap = this.$store.getters['swapStore/addressToSwap']
    if (addressToSwap.isMultisig) {
      // search in swapData with addressToSwap
    } else {
      this.dataAccountToSwap = this.swapData
    }

    this.configForm = this.getConfigForm()
  },
  components: {
    'custom-breadcrumbs': () => import('@/components/shared/Breadcrumbs'),
    'custom-buttons': () => import('@/components/shared/Buttons'),
    'swap-certified': () => import('@/components/SwapCertified')
  },
  methods: {
    ...mapMutations(['SHOW_LOADING']),
    async action (action) {
      switch (action) {
        case 'continue':
          this.sendingForm = true
          if (this.$store.getters['accountStore/isLogged']) {
            console.log('isLogged')
          } else {
            const currentWallet = this.$store.getters['walletStore/currentWallet']
            if (currentWallet) {
              const catapultAccount = currentWallet.accounts.find(x => x.name === this.dataAccountToSwap.nameAccount)
              if (catapultAccount) {
                let decrypt = this.decrypt(catapultAccount, this.password)
                if (decrypt.privateKey) {
                  const amount = this.amount
                  this.sendingForm = true
                  this.SHOW_LOADING(true)
                  const data = await this.swap(currentWallet.name, this.dataAccountToSwap, catapultAccount, amount, decrypt.privateKey)
                  this.certified = data.certified
                  this.certified.privateKey = decrypt.privateKey
                  decrypt = null
                  this.clear()
                  this.SHOW_LOADING(false)
                } else {
                  this.password = ''
                  this.throwError('Invalid password', false)
                }
              } else {
                this.throwError('Error! try again', true)
              }
            } else {
              this.throwError('Error! try again', true)
            }
          }

          this.sendingForm = false
          break
        case 'cancel':
          this.$router.push('/').catch(e => {})
          break
      }
    },
    clear () {
      this.sendingForm = false
      this.validateBalance()
      this.$refs.form.reset()
      this.$refs.amount.$el.getElementsByTagName('input')[0].value = ''
      this.amount = ''
    },
    throwError (msg, redirect) {
      this.$store.dispatch('showMSG', {
        snackbar: true,
        text: msg,
        color: 'error'
      })

      if (redirect) {
        this.$router.push('/').catch(e => {})
      }
    },
    selectMaxAmount () {
      this.$refs.amount.$el.getElementsByTagName('input')[0].value = this.dataAccountToSwap.balance
      this.amount = this.dataAccountToSwap.balance
      this.validateBalance()
    },
    validateBalance () {
      let amount = null
      try {
        amount = parseFloat(this.amount.split(',').join(''))
      } catch (error) {
        amount = Number(this.amount)
      }

      if (amount !== null && amount !== undefined) {
        if (amount > parseFloat(this.dataAccountToSwap.balance.split(',').join(''))) {
          this.isValidBalance = 'Insufficient balance'
        } else if (amount === 0) {
          this.isValidBalance = 'Cannot enter amount zero'
        } else {
          this.isValidBalance = true
        }
      }
    }
  },
  computed: {
    buttons () {
      const arrayBtn = this.arrayBtn
      arrayBtn['cancel'].disabled = this.sendingForm
      arrayBtn['continue'].disabled = !this.valid || this.sendingForm || this.isValidBalance !== true
      arrayBtn['continue'].loading = this.sendingForm
      return arrayBtn
    }
  }
}
</script>

<style>
.v-alert--outlined {
  border: 3px solid currentColor !important;
}
</style>
