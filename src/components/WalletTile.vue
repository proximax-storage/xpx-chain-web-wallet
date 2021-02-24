<template>
  <div class="tile tile-centered">
    <div class="tile-icon pt-1">
      <img
        src="@/assets/images/icon-wallet-full-color-80h.svg"
        alt="From a Wallet Backup"
        width="40"
      />
    </div>
    <div class="tile-content">
      <div class="tile-title">{{ wallet.name }}</div>
      <div class="tile-subtitle text-gray">
        Account(s): {{ wallet.accounts.length }}
      </div>
    </div>
    <div class="tile-action">
      <button class="btn btn-secondary btn-action" @click="$emit('delete')">
        <i class="icon icon-delete"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "WalletTile",
  props: {
    wallet: {
      type: Object,
      default: null,
    },
  },
  emits: ["delete"],
};
</script>

<style lang="scss" scoped>
@import "@/assets/main";
@import "spectre.css/src/variables";
@import "spectre.css/src/mixins/shadow";
@import "spectre.css/src/mixins/text";
@import "spectre.css/src/tiles";

.tile {
  @include shadow-variant($unit-o);
  padding: $unit-2;
  margin: $unit-2 0;
  border: $border-width solid $border-color;
  border-radius: $border-radius;
}
</style>
