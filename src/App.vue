<template>
  <v-app>
    <!-- Menu -->
    <menu-item></menu-item>

     <!-- Overlay -->
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <!-- Message -->
    <v-snackbar
      v-model="snackbar.snackbar"
      :bottom="snackbar.y === 'bottom'"
      :top="snackbar.y === 'top'"
      :right="snackbar.x === 'right'"
      :left="snackbar.x === 'left'"
      :vertical="snackbar.mode === 'vertical'"
      :color="snackbar.color"
      :multi-line="snackbar.mode === 'multi-line'"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <v-btn dark text @click="snackbar.snackbar = false">Close</v-btn>
    </v-snackbar>

    <!-- Content -->
    <v-content>
      <transition name="fade" mode="out-in">
        <router-view :key="$route.path"></router-view>
      </transition>
    </v-content>

    <v-footer app absolute>
      <v-row>
        <v-col cols="12" class="pt-0 pb-0 text-center">
          <span class="caption font-weight-medium">© ProximaX 2019</span>
        </v-col>
        <v-col cols="12" class="pt-0 pb-0 text-center">
          <span class="caption font-weight-regular">
            Please report any issues identified to our <a href="https://t.me/proximaxhelpdesk" target="_blank"> helpdesk. </a>
          </span>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'App',
  data: () => ({
    //
  }),
  components: {
    'menu-item': () => import('@/components/Menu')
  },
  computed: {
    ...mapState(['overlay', 'snackbar']),
    ...mapGetters('accountStore', ['isLogged'])
  }
}
</script>
