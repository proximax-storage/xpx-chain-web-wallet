<template>
  <table class="table table-striped" :class="{ 'table-stack': !info }">
    <thead v-if="!info"></thead>
    <transition-group name="app-table" tag="tbody">
      <template v-if="info">
        <tr v-for="k in Object.keys(tableData)" :key="k">
          <td class="text-bold">{{ keyToHeaderText(k) }}</td>
          <td class="text-ellipsis">{{ tableData[k] }}</td>
        </tr>
      </template>
    </transition-group>
  </table>
</template>

<script>
export default {
  name: "AppTable",
  props: {
    tableData: {
      type: Object,
      default: null,
    },
    info: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const keyToHeaderText = (keyString) => {
      var result = keyString.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    };

    return {
      keyToHeaderText,
    };
  },
};
</script>

<style lang="scss" scoped>
.app-table-move {
  transition: all 1s ease;
}

.app-table-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
</style>
