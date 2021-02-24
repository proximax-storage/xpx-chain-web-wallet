<template>
  <div class="columns">
    <div
      v-for="item in appStore.state.wallets"
      :key="item.name"
      class="column col-4 col-md-6 col-sm-12"
    >
      <WalletTile :wallet="item" @delete="appStore.deleteWallet(item.name)" />
    </div>
  </div>
</template>

<script>
import WalletTile from "@/components/WalletTile.vue";
import { inject } from "vue";

export default {
  name: "ViewWallets",
  components: {
    WalletTile,
  },
  setup() {
    const appStore = inject("appStore");
    return {
      appStore,
    };
  },
};
</script>
