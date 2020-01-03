
<template>
  <div>
    <v-row>
      <v-col cols="10">
        <!-- Title & Subtitle -->
        <title-subtitle :title="title" :subtitle="subtitle" :separed1="true"></title-subtitle>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      title: 'Create Wallet',
      subtitle: 'Restore your existing ProximaX Sirius Wallet, import a private key from another service or create a new wallet right now!'
    }
  },
  components: {
    'title-subtitle': () => import('@/components/shared/Title')
  }
}
</script>
