
<template>
  <v-container>
    <v-row>
      <v-col cols="11" class="mx-auto">
        <!-- Title & Subtitle -->
        <custom-breadcrumbs :items="breadcrumbsItems" :divider="'>'"></custom-breadcrumbs>

        <div class="row">
          <v-col cols="12 text-center">
            <span class="font-weight-medium title">{{swapTitle}}</span>
          </v-col>

          <v-col cols="12" md="10" lg="8" class="mx-auto">
            <!-- Warning Message -->
            <v-alert outlined type="warning" prominent class="text-center line-h-1-02em" dense>
              <span class="gray-black--text caption">
                Swap process may take several hours to complete. If you wish to proceed, you will receive a certificate containing your transaction hash for you records.
              </span>
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
export default {
  data: () => {
    return {
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
          disabled: false,
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
      swapTitle: 'Would you like to swap over assets from NIS1 Blockchain to Sirius Blockchain?'
    }
  },
  components: {
    'custom-breadcrumbs': () => import('@/components/shared/Breadcrumbs'),
    'custom-buttons': () => import('@/components/shared/Buttons')
  },
  methods: {
    action (action) {
      switch (action) {
        case 'continue':
          console.log('CONTINUE....')
          break
        case 'cancel':
          this.$router.push('/').catch(e => {})
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
