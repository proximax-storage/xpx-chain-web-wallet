<template>
  <v-app>
    <!-- Menu -->
    <menu-item></menu-item>

    <!-- Content -->
    <v-content>
      <transition name="fade" mode="out-in">
        <router-view :key="$route.path"></router-view>
      </transition>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    //
  }),
  components: {
    'menu-item': () => import('@/components/Menu')
  }
}
</script>
