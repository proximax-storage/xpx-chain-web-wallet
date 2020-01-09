<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12" class="mx-auto mt-5 pb-0">
          <ul class="v-breadcrumbs pb-0 pl-0">
            <li v-for="(item, key) of items" :key="key" class="pl-0">
              <span class="subtitle-1 font-weight-medium" :class="item.style">{{item.text}}</span>
              <span class="ml-2 pr-2 gray-disabled--text subtitle-1" v-if="showSeparator(key)">{{divider}}</span>
            </li>
          </ul>
          <hr class="mb-1" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  props: ['items', 'divider'],
  methods: {
    showSeparator (key) {
      return key + 1 < this.items.length
    }
  }
}
</script>
