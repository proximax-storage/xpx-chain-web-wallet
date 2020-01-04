
<template>
  <v-container>
    <v-row>
      <v-col cols="11" sm="11" class="mx-auto">
        <!-- Title & Subtitle -->
        <title-subtitle :title="title" :subtitle="subtitle" :separed2="true"></title-subtitle>

        <v-row>
          <v-col cols="12" class="pt-0 text-center headline font-weight-regular">
            <span>rperaza</span>
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
                    <span class="body-2">VA3ABO-RDH7SM-FWE2I3-3XFMZZ-62T5W5-GBQWGN-AUI6</span>
                  </v-col>

                  <!-- Icon -->
                  <v-col cols="2" class="pt-0 pb-0 text-right">
                    <v-btn
                      text
                      icon
                      @click="doCopy('Address', 'VA3ABO-RDH7SM-FWE2I3-3XFMZZ-62T5W5-GBQWGN-AUI6')"
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
              <v-col cols="12" class="box-gray mb-5">
                <v-row class="d-flex align-center">
                  <v-col cols="10" class="pt-0 pb-0 overflow-ellipsis-nowrap mx-auto">
                    <!-- Name Wallet -->
                    <span class="body-1 font-weight-medium">
                      Private Key:
                      <br />
                    </span>
                    <!-- Private Key -->
                    <span
                      class="body-2"
                    >BB7720C3489CB492066464F2157771037D899BA3CE8BA7FE1AF4CC5900B572D2</span>
                  </v-col>

                  <!-- Icon -->
                  <v-col cols="2" class="pt-0 pb-0 text-right">
                    <v-btn
                      text
                      icon
                      @click="doCopy('Private Key', 'BB7720C3489CB492066464F2157771037D899BA3CE8BA7FE1AF4CC5900B572D2')"
                    >
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Buttons -->
            <custom-buttons @action="triggerClick" :arrayBtn="arrayBtn"></custom-buttons>
            <!-- <v-row class="d-flex justify-center">
              <template v-for="(item, key) of arrayBtn">
                <v-btn
                  :key="key"
                  rounded
                  color="primary"
                  class="text-transform-none pl-8 pr-8 mt-2 mr-3 subtitle-1 font-regular"
                  @click="triggerClick(item.action)"
                >{{item.text}}</v-btn>
              </template>
            </v-row>-->
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import generalMixins from '../../mixins/general'

export default {
  mixins: [generalMixins],
  data: () => {
    return {
      title: 'Congratulations!',
      subtitle: 'Your wallet has been successfully created.',
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
    showPrivateKey () {
      console.log('SHOW PRIVATE KEY')
    },
    triggerClick (action) {
      switch (action) {
        case 'showPrivateKey':
          this.showPrivateKey()
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
