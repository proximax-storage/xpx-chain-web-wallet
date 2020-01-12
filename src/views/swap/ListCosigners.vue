
<template>
  <v-container>
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
              <span class="font-weight-regular title">{{listAccountsTitle}}</span> <br>
              <span class="font-weight-regular caption">{{listAccountsSubtitle}}</span>
            </v-col>
          </v-row>

          <!-- Address -->
          <template v-for="(accounts, key) of accountsList">
            <v-row :key="key">
              <v-col cols="11" md="10" lg="9" class="box-gray mb-3 mx-auto">
                <v-row>
                  <v-col cols="12" sm="9" md="10" class="word-break-all">
                    <!-- NIS1 Address -->
                    <div>
                      <span class="body-2">{{accounts.address}} &nbsp;</span>
                      <span v-if="accounts.isMultisig" class="fs-07rem font-weight-medium font-italic primary--text">-Multisig</span>
                    </div>
                    <!-- NIS1 Balance -->
                    <div class="d-flex align-center">
                      <span class="body-1 font-weight-medium pr-1">Balance:</span>
                      <span class="body-1 font-weight-medium pr-1" v-quantity="{q: accounts.balance, coin: 'XPX'}"></span>
                      <img
                        class="ml-1 mr-1"
                        alt="logo"
                        width="20"
                        :src="require(`@/assets/img/icon-prx-xpx-green-16h-proximax-sirius-wallet.svg`)"
                      />
                    </div>
                  </v-col>

                  <v-col cols="12" sm="3" md="2" class="word-break-all d-flex align-center justify-center pt-0 pb-0">
                    <v-btn @click="selectAccount(accounts.address, accounts.isMultisig)" class="caption" outlined rounded small color="primary">Select <v-icon color="primary">mdi-chevron-right</v-icon></v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>

        <!-- Buttons -->
        <custom-buttons @action="goToHome" :arrayBtn="arrayBtn"></custom-buttons>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data: () => {
    return {
      arrayBtn: {
        continue: {
          key: 'home',
          action: 'goToHome',
          disabled: false,
          color: 'primary',
          loading: false,
          text: 'Home'
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
      accountsList: [],
      listAccountsTitle: 'Please select a NIS1 account',
      listAccountsSubtitle: 'This is the list of attached accounts of the account you have imported'
    }
  },
  beforeMount () {
    const swapData = this.$store.getters['swapStore/swapData']
    console.log(swapData)
    this.accountsList = [{
      address: swapData.address.pretty(),
      balance: swapData.balance,
      isMultisig: false
    }]

    swapData.multisigAccountsInfo.forEach(element => {
      this.accountsList.push({
        address: element.address,
        balance: element.balance,
        isMultisig: true
      })
    })
  },
  components: {
    'custom-breadcrumbs': () => import('@/components/shared/Breadcrumbs'),
    'custom-buttons': () => import('@/components/shared/Buttons')
  },
  methods: {
    ...mapMutations('swapStore', ['SET_ADDRESS_TO_SWAP']),
    goToHome () {
      this.$router.push('/').catch(e => {})
    },
    selectAccount (address, isMultisig) {
      this.SET_ADDRESS_TO_SWAP({ address, isMultisig })
      this.$router.push('/swap-transfer-assets').catch(e => {})
    }
  }
}
</script>

<style>
.v-alert--outlined {
    border: 3px solid currentColor !important;
}
</style>
