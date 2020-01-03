<template>
  <v-row>
    <v-col cols="12" sm="6" class="mx-auto d-flex justify-center justify-sm-end">
      <v-btn
        :loading="loading1"
        :disabled="disabled1"
        rounded
        color="primary"
        class="text-transform-none pl-8 pr-8 subtitle-1 font-regular"
        @click="eventClick(1)"
      >{{title1}}</v-btn>
    </v-col>

    <v-col cols="12" sm="6" class="mx-auto d-flex justify-center justify-sm-start" v-if="title2">
      <v-btn
        :loading="loading2"
        :disabled="disabled2"
        rounded
        color="primary"
        class="text-transform-none pl-8 pr-8 subtitle-1 font-regular"
        @click="eventClick(2)"
      >{{title2}}</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: ['title1', 'title2', 'loading1', 'disabled1', 'loading2', 'disabled2'],
  methods: {
    eventClick (type) {
      if (type === 1) {
        this.$emit('click-one', true)
      } else {
        this.$emit('click-two', true)
      }
    }
  }
}
</script>
