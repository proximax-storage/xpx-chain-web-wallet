
<template>
  <div>
    <v-row>
      <v-col cols="10" class="mx-auto">
        <!-- Title & Subtitle -->
        <title-subtitle :title="title" :subtitle="subtitle" :separed1="true"></title-subtitle>

        <v-row>
          <v-col cols="12">
            <v-autocomplete
              v-model="networkSelected"
              :items="networksType"
              item-text="title"
              item-value="value"
              label="Network type"
              :hint="networkSelected"
              return-object
            ></v-autocomplete>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      title: 'Create Wallet',
      subtitle:
        'Restore your existing ProximaX Sirius Wallet, import a private key from another service or create a new wallet right now!',
      networkSelected: '',
      networksType: [{}]
    }
  },
  components: {
    'title-subtitle': () => import('@/components/shared/Title')
  }
}
</script>
