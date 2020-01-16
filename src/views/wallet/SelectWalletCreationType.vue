<template>
  <div>
    <v-container>
      <v-row>
         <v-col cols="11" sm="10" class="mx-auto">
          <!-- Title & Subtitle -->
          <title-subtitle :title="title" :separed1="true"></title-subtitle>
        </v-col>
      </v-row>

      <!-- Items -->
      <v-row>
        <v-col cols="12" sm="11" md="8" lg="7" class="mx-auto">
          <v-row>
            <template v-for="(item, key) of items">
              <v-col :key="key" cols="12" sm="4" class="d-flex justify-center justify-sm-end">
                <v-row>
                  <v-col cols="12" class="text-center">
                    <div class="d-flex justify-center pb-2">
                      <v-img
                        :src="require(`@/assets/img/${item.icon}`)"
                        width="40"
                        height="40"
                        max-width="40"
                        max-height="40"
                      ></v-img>
                    </div>
                    <div class="text-center pb-1">
                      <span class="gray-black--text">{{item.title}}</span>
                    </div>
                    <v-btn
                      rounded
                      color="primary"
                      class="text-transform-none pl-8 pr-8 subtitle-1 font-regular"
                      router :to="item.route"
                    >{{item.nameButton}}</v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </template>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      title: 'Select Wallet Creation Type',
      items: [
        {
          title: 'New Wallet',
          nameButton: 'Create',
          icon: 'icon-add-new-blue.svg',
          route: '/create-new-wallet'
        },
        {
          title: 'From a Private Key',
          nameButton: 'Create',
          icon: 'icon-private-key-blue.svg',
          route: '/create-wallet-from-private-key'
        },
        {
          title: 'From a Wallet Backup',
          nameButton: 'Import',
          icon: 'icon-wallet-import-blue.svg',
          route: '/create-new-wallet'
        }
      ]
    }
  },
  components: {
    'title-subtitle': () => import('@/components/shared/Title')
  }
}
</script>
