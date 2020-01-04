<template>
  <div>
    <v-container>
      <!-- Title & Subtitle -->
      <title-subtitle :title="title" :subtitle="sub"></title-subtitle>

      <!-- LIST -->
      <v-row>
        <v-col cols="12" sm="9" md="10" lg="11" class="mx-auto">
          <v-row>
            <template v-for="(service, key) of servicesList">
              <v-col :key="key" cols="12" sm="6" md="6" lg="3" class="pt-0">
                <v-row>
                  <v-col cols="12" class="d-flex justify-center">
                    <v-img
                      :src="require(`@/assets/img/${service.image}`)"
                      max-width="70"
                      max-height="70"
                    ></v-img>
                  </v-col>
                  <v-col cols="12" class="text-center pb-0 pt-0">
                    <span class="fs-1-1rem font-weight-bold">{{service.title}}</span>
                  </v-col>
                  <v-col cols="12" class="text-center pt-0 pb-0">
                    <span class="subtitle-2 font-weight-regular">{{service.description}}</span>
                  </v-col>
                </v-row>
              </v-col>
            </template>

            <v-col cols="11" md="10" class="mx-auto pt-0">
              <hr />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Buttons -->
      <custom-buttons @action="action" :arrayBtn="arrayBtn"></custom-buttons>
    </v-container>
  </div>
</template>

<script>
import generalMixins from '../mixins/general'

export default {
  name: 'home',
  mixins: [generalMixins],
  data: () => ({
    title: 'ProximaX Sirius Wallet',
    sub: 'The secure interface that connects to the Proximax Sirius platform.',
    servicesList: [],
    arrayBtn: {
      signIn: {
        action: 'signIn',
        disabled: false,
        color: 'primary',
        loading: false,
        text: 'Sign In'
      },
      create: {
        action: 'create',
        disabled: false,
        color: 'primary',
        loading: false,
        text: 'Create'
      }
    }
  }),
  components: {
    'title-subtitle': () => import('@/components/shared/Title'),
    'custom-buttons': () => import('@/components/shared/Buttons')
  },
  beforeMount () {
    this.servicesList = [
      this.buildStructureService(
        'Blockchain',
        true,
        'Multisig, aggregated tx, cross chain, metadata.',
        'icon-blockchain-full-color-80h-proximax-sirius-wallet.svg'
      ),
      this.buildStructureService(
        'Storage',
        true,
        'P2P decentralised storage for any type of file.',
        'icon-storage-full-color-80h-proximax-sirius-wallet.svg'
      ),
      this.buildStructureService(
        'Streaming',
        true,
        'P2P decentralised streaming for video and chat.',
        'icon-streaming-full-color-80h-proximax-sirius-wallet.svg'
      ),
      this.buildStructureService(
        'Supercontracts',
        true,
        'Easily modifiable digital contracts.',
        'icon-streaming-full-color-80h-proximax-sirius-wallet.svg'
      )
    ]
  },
  methods: {
    action (action) {
      if (action === 'signIn') {
        this.signIn()
      } else {
        this.createWallet()
      }
    },
    createWallet () {
      console.log('Create wallet')
      this.$router.push('/create-wallet').catch(e => {})
    },
    signIn () {
      console.log('signIn')
    }
  }
}
</script>
