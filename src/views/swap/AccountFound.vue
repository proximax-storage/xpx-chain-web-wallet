
<template>
  <v-container>
    <v-row>
      <v-col cols="11" class="mx-auto">
        <!-- Title & Subtitle -->
        <title-subtitle :title="title" :subtitle="subtitle" :separed1="true" :subtitleClass="subtitleClass"></title-subtitle>

        <div class="row">
          <v-col cols="12 text-center">
            <span class="font-weight-medium title">{{swapTitle}}</span>
          </v-col>

          <v-col cols="12" sm="11" md="10" lg="8" class="mx-auto">
            <!-- Warning Message -->
            <v-alert outlined type="warning" prominent class="text-center line-h-1-02em" dense>
              <span class="gray-black--text caption">{{warningMessage}}</span>
            </v-alert>
          </v-col>
        </div>

        <!-- Buttons -->
        <custom-buttons @action="action" :arrayBtn="arrayBtn"></custom-buttons>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapMutations } from 'vuex'
import swapMixin from '../../mixins/swap'

export default {
  mixins: [swapMixin],
  data: () => {
    return {
      arrayBtn: {
        cancel: {
          key: 'cancel',
          action: 'cancel',
          disabled: false,
          color: 'primary',
          loading: false,
          text: 'Not Interested'
        },
        continue: {
          key: 'continue',
          action: 'continue',
          disabled: false,
          color: 'primary',
          loading: false,
          text: 'Yes, Please'
        }
      },
      subtitleClass: 'caption',
      subtitle: 'Your imported private key has assets on the NIS1 Blockchain.',
      swapTitle: 'Would you like to swap over assets from NIS1 Blockchain to Sirius Blockchain?',
      title: 'Mainnet Swap',
      warningMessage: 'Swap process may take several hours to complete. If you wish to proceed, you will receive a certificate containing your transaction hash for you records.'
    }
  },
  components: {
    'title-subtitle': () => import('@/components/shared/Title'),
    'custom-buttons': () => import('@/components/shared/Buttons')
  },
  methods: {
    ...mapMutations('swapStore', ['SET_ACCOUNT_TO_SWAP']),
    action (action) {
      switch (action) {
        case 'continue':
          const swapData = this.$store.getters['swapStore/swapData']
          console.log('SWAP DATA -----> ', swapData)
          if (swapData.cosignerAccounts.length > 0) {
            this.$router.push('/swap-list-cosigners').catch(e => {})
          } else {
            this.SET_ACCOUNT_TO_SWAP({
              account: swapData.address,
              isMultisig: false
            })
            this.$router.push('/swap-transfer-assets').catch(e => {})
          }
          break
        case 'cancel':
          this.$router.push('/').catch(e => {})
          break
        default:
          console.log('default')
          break
      }
    }
  }
}
</script>

<style>
.v-alert--outlined {
    border: 3px solid currentColor !important;
}
</style>
