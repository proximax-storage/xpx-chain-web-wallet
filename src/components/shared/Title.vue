<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12" class="mx-auto text-center mt-5 pb-0">
          <span class="headline font-weight-bold primary--text">{{title}}</span>
        </v-col>

        <v-col cols="11" md="10" class="mx-auto pt-1 pb-0" v-if="separed1">
          <hr />
        </v-col>

        <v-col cols="12" class="mx-auto text-center pt-0" v-if="subtitle">
          <span class="subtitle-1 font-regular gray-black--text">{{subtitle}}</span>
        </v-col>

        <v-col cols="11" md="10" class="mx-auto pt-0 pb-0" v-if="separed2">
          <hr />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  props: ['title', 'subtitle', 'separed1', 'separed2']
}
</script>
