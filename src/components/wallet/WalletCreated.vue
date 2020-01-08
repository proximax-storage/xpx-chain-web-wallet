
<template>
  <v-container>
    <v-row>
      <v-col cols="11" class="mx-auto">
        <!-- Title & Subtitle -->
        <title-subtitle :title="title" :subtitle="subtitle" :separed2="true"></title-subtitle>

        <v-row>
          <!-- Wallet name -->
          <v-col cols="12" class="pt-0 text-center headline font-weight-regular">
            <span>{{name}}</span>
          </v-col>

          <v-col cols="12" sm="10" md="9" lg="8" class="mx-auto">
            <v-row>
              <!-- Address -->
              <v-col cols="12" class="box-gray mb-3">
                <v-row class="d-flex align-center">
                  <v-col cols="10" class="pt-0 pb-0 overflow-ellipsis-nowrap mx-auto">
                    <!-- Name Wallet -->
                    <span class="body-1 font-weight-medium">
                      Address:
                      <br />
                    </span>
                    <!-- Address -->
                    <span class="body-2">{{address}}</span>
                  </v-col>

                  <!-- Icon -->
                  <v-col cols="2" class="pt-0 pb-0 text-right">
                    <v-btn
                      text
                      icon
                      @click="doCopy('Address', address)"
                    >
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Warning Message -->
              <v-col cols="12">
                <v-alert outlined type="warning" prominent class="text-center line-h-1-02em" dense>
                  <span class="gray-black--text caption">
                    Make sure you store your private key in a safe place.
                    <br />Access to your digital assets cannot be recovered without it.
                  </span>
                </v-alert>
              </v-col>

              <!-- Private Key -->
              <v-col cols="12" class="box-gray mb-5" v-if="showPrivateKey">
                <v-row class="d-flex align-center">
                  <v-col cols="10" class="pt-0 pb-0 overflow-ellipsis-nowrap mx-auto">
                    <!-- Name Wallet -->
                    <span class="body-1 font-weight-medium">
                      Private Key:
                      <br />
                    </span>
                    <!-- Private Key -->
                    <span class="body-2 d-flex">{{pvk}}</span>
                  </v-col>

                  <!-- Icon -->
                  <v-col cols="2" class="pt-0 pb-0 text-right">
                    <v-btn
                      text
                      icon
                      @click="doCopy('Private Key', pvk)"
                    >
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Buttons -->
            <custom-buttons @action="action" :arrayBtn="getArrayBtn"></custom-buttons>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import generalMixins from '../../mixins/general'
import nis1Mixins from '../../mixins/nis1'

export default {
  mixins: [generalMixins, nis1Mixins],
  props: ['walletInfo'],
  data: () => {
    return {
      address: '',
      name: '',
      pvk: '',
      title: 'Congratulations!',
      subtitle: 'Your wallet has been successfully created.',
      showPrivateKey: false,
      arrayBtn: {
        showPvk: {
          key: 'showPvk',
          action: 'showPrivateKey',
          disabled: false,
          color: 'primary',
          loading: false,
          text: 'Show Private Key'
        },
        savePaperWallet: {
          key: 'showPvk',
          action: 'savePaperWallet',
          disabled: false,
          color: 'primary',
          loading: false,
          text: 'Save Paper Wallet'
        },
        continue: {
          key: 'continue',
          action: 'continue',
          disabled: false,
          color: 'primary',
          loading: false,
          text: 'Continue'
        }
      }
    }
  },
  components: {
    'title-subtitle': () => import('@/components/shared/Title'),
    'custom-buttons': () => import('@/components/shared/Buttons')
  },
  methods: {
    action (action) {
      switch (action) {
        case 'showPrivateKey':
          this.showPrivateKey = !this.showPrivateKey
          break
        case 'savePaperWallet':
          console.log('savePaperWallet')
          break
        case 'continue':
          this.$router.push('/').catch(e => {})
          break
        default:
          console.log('default')
          break
      }
    }
  },
  computed: {
    getArrayBtn () {
      const arrayBtn = this.arrayBtn
      arrayBtn['showPvk'].text = (this.showPrivateKey) ? 'Hide Private Key' : 'Show Private Key'
      return arrayBtn
    }
  },
  async beforeMount () {
    const walletInfo = this.walletInfo.data
    this.address = walletInfo.catapulWallet.address.pretty()
    this.name = walletInfo.catapulWallet.name
    this.pvk = this.walletInfo.pvk.toUpperCase()
    if (walletInfo.nis1Account) {
      this.arrayBtn.continue.disabled = true
      this.arrayBtn.continue.loading = true
      const nis1PublicAccount = this.createPublicAccountFromPublicKey(walletInfo.nis1Account.publicKey)
      const info = await this.swap(nis1PublicAccount)
      console.log('info', info)
      this.arrayBtn.continue.disabled = false
      this.arrayBtn.continue.loading = false
    }
  }
}
</script>

<style>
.v-alert:not(.v-sheet--tile) {
  border-radius: 20px;
}

.v-alert--outlined {
  border: 3px solid currentColor !important;
}

.v-alert--prominent .v-alert__icon:after {
  opacity: 0.2 !important;
}
</style>
