<template>
  <div>
    <!-- Toolbar -->
    <v-app-bar color="white" app flat dense>
      <img
        class="mr-3"
        :src="require('@/assets/img/logo.svg')"
        alt="logo"
        height="35"
      />

      <div style="height: 100%" class="d-flex align-end">
        <span class="body-2 font-regular gray-light--text">{{getVersion}}</span>
      </div>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <template v-for="(link, key) of links">
          <v-btn router :to="link.route" :key="key" text small color="primary" class="font-regular body-2">{{link.title}}</v-btn>
        </template>
      </v-toolbar-items>
    </v-app-bar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    drawer: false,
    links: [
      {
        title: 'Home',
        icon: 'mdi-view-dashboard',
        route: '/',
        viewLogged: false
      },
      {
        title: 'Wallets',
        icon: 'mdi-account',
        route: '/wallets',
        viewLogged: false
      }
    ]
  }),
  computed: {
    ...mapGetters(['pseudonymApp']),
    getVersion () {
      return `v${this.$environment.version}`
    }
  },
  methods: {
    goToHome () {
      this.$router.push('/home').catch(e => console.log(e))
    }
  }
}
</script>

<style scoped>
.v-btn {
  text-transform: none !important;
}
</style>
