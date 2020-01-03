<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="11">
          <!-- Title & Subtitle -->
          <title-subtitle :title="title" :separed1="true"></title-subtitle>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      title: 'Create Wallet'
    }
  },
  components: {
    'title-subtitle': () => import('@/components/shared/Title')
  }
}
</script>
