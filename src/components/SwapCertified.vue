
<template>
  <v-container>
    <v-row>
      <v-col cols="11" class="mx-auto">
        <!-- Title & Subtitle -->
        <title-subtitle :title="title" :subtitle="subtitle" :separed2="true"></title-subtitle>

        <!-- Swap Title -->
        <v-row>
          <v-col cols="12" class="text-center pt-2">
            <span class="font-weight-regular fs-1-2rem">Swap Certificate:</span>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="10" lg="8" class="mx-auto border-gray-5px pt-0 pb-0">
            <v-row>
              <v-col cols="12" sm="8" md="7" lg="8" class="mx-auto pa-5 pb-0">
                <v-row>
                  <!-- Sirius Account -->
                  <v-col cols="12" class="w-w-b-w word-break-all pt-0">
                    <span class="fs-08rem font-weight-bold">
                      Sirius Account:
                      <br />
                    </span>
                    <span class="fs-09rem">{{certified.siriusAddres}}</span>
                  </v-col>
                  <!-- Nis1 timestamp -->
                  <v-col cols="12" class="w-w-b-w word-break-all pt-0">
                    <span class="fs-08rem font-weight-bold">NIS1 Timestamp:&nbsp;</span>
                    <span class="fs-09rem">{{certified.nis1Timestamp}}</span>
                  </v-col>
                  <!-- Nis1 public key -->
                  <v-col cols="12" class="w-w-b-w word-break-all pt-0">
                    <span class="fs-08rem font-weight-bold">
                      NIS1 Public Key:
                      <br />
                    </span>
                    <span
                      class="fs-09rem"
                    >{{certified.nis1PublicKey}}</span>
                  </v-col>
                  <!-- QR & Hash -->
                  <v-col cols="12 pb-0">
                    <v-row>
                      <!-- QR -->
                      <v-col cols="6" md="6" lg="5" class="pt-0 pb-0">
                        <vue-qr
                          :logoSrc="require(`@/assets/${logo}`)"
                          :text="`${urlExplorer}${certified.nis1TransactionHash}`"
                          :size="150"
                          :dotScale="0.5"
                          :correctLevel="1"
                          :margin="0"
                          :callback="qrBase64"
                        ></vue-qr>
                      </v-col>
                      <!-- Hash -->
                      <v-col cols="6" md="6" lg="7" class="w-w-b-w word-break-all pt-0 pb-0">
                        <span class="fs-08rem font-weight-bold">
                          NIS1 Transation Hash:
                          <br />
                        </span>
                        <span class="fs-09rem primary--text cursor-pointer">
                          <a
                            class="text-d-none"
                            :href="`${urlExplorer}${certified.nis1TransactionHash}`"
                            target="_blank"
                          >{{certified.nis1TransactionHash}}</a>
                        </span>
                      </v-col>
                      <!-- Swap Note -->
                      <v-col cols="12" class="pt-2 pb-0">
                        <p class="fs-08rem"><b>Note: </b> The Swap Process may take a few hours to complete.</p>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <!-- Badge -->
              <v-col cols="12" sm="4" md="5" lg="4" class="background-blue-gradient d-flex align-center justify-center mx-auto">
                <v-img :src="require(`@/assets/img/${badge}`)" max-width="150" max-height="150"></v-img>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Warning Message -->
        <v-row>
          <v-col cols="12" md="10" lg="8" class="mx-auto mt-8">
            <v-alert outlined type="warning" prominent class="text-center line-h-1-02em" dense>
              <span class="gray-black--text caption">{{warningText}}</span>
            </v-alert>
          </v-col>
        </v-row>

        <!-- Checkbox -->
        <v-row>
          <v-col cols="12" md="10" lg="8" class="mx-auto d-flex align-center justify-center pb-0">
            <v-checkbox v-model="confirmSwap" :label="`I confirm that I have saved a copy of my certificate.`"></v-checkbox>
          </v-col>
        </v-row>

        <!-- Buttons -->
        <custom-buttons class="mt-4" @action="action" :arrayBtn="arrayBtn"></custom-buttons>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VueQr from 'vue-qr'

export default {
  props: ['certified'],
  beforeMount () {
    this.urlExplorer = this.$store.getters['swapStore/configNIS1'].urlExplorer
    console.log(this.urlExplorer)
  },
  data: () => {
    return {
      arrayBtn: {
        save: {
          key: 'save',
          action: 'save',
          disabled: false,
          color: 'primary',
          loading: false,
          text: 'Save'
        },
        continue: {
          key: 'continue',
          action: 'continue',
          disabled: true,
          color: 'primary',
          loading: false,
          text: 'Continue'
        }
      },
      badge: 'badge-silver-proximax-sirius-wallet.svg',
      base64QR: '',
      confirmSwap: false,
      urlExplorer: '',
      logo: 'ProximaX-Favicon.png',
      subtitle: 'The Swap Process has already started.',
      title: 'Congratulations!',
      warningText: 'Save a copy of your certificate. It is needed in the event of an error.'
    }
  },
  methods: {
    action (action) {
      switch (action) {
        case 'continue':
          this.$router.push('/').catch(e => {})
          break
        case 'save':
          const param = {
            qr: this.base64QR,
            address: this.certified.siriusAddres,
            timestamp: this.certified.nis1Timestamp,
            publicKey: this.certified.nis1PublicKey,
            hash: this.certified.nis1TransactionHash
          }

          const pdf = this.$pdfGenerator.swapCertified(param)
          pdf.save(`${this.certified.nis1TransactionHash}_swap_certified`)
          break
      }
    },
    qrBase64 (base64) {
      this.base64QR = base64
    }
  },
  watch: {
    confirmSwap: function () {
      const arrayBtn = this.arrayBtn
      arrayBtn.continue.disabled = !this.confirmSwap
    }
  },
  components: {
    VueQr,
    'title-subtitle': () => import('@/components/shared/Title'),
    'custom-buttons': () => import('@/components/shared/Buttons')
  }
}
</script>

<style>
.v-alert--outlined {
  border: 3px solid currentColor !important;
}
</style>
