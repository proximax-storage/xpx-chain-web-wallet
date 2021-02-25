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
      <button class="btn btn-secondary btn-action" @click="showModal = true">
        <i class="icon icon-delete"></i>
      </button>
    </div>
  </div>
  <div class="modal" :class="{ active: showModal }">
    <a class="modal-overlay" aria-label="Close" @click="showModal = false"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a
          class="btn btn-clear float-right"
          aria-label="Close"
          @click="showModal = false"
        ></a>
        <div class="modal-title h5">Delete Wallet</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <DeleteConfirmation
            @confirm="
              $emit('delete');
              showModal = false;
            "
            @cancel="showModal = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DeleteConfirmation from "@/components/DeleteConfirmation.vue";
import { ref } from "vue";

export default {
  name: "WalletTile",
  components: {
    DeleteConfirmation,
  },
  props: {
    wallet: {
      type: Object,
      default: null,
    },
  },
  emits: ["delete"],
  setup() {
    const showModal = ref(false);

    return {
      showModal,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/main";
@import "spectre.css/src/variables";
@import "spectre.css/src/mixins/shadow";
@import "spectre.css/src/mixins/text";
@import "spectre.css/src/modals";
@import "spectre.css/src/tiles";

.tile {
  @include shadow-variant($unit-o);
  padding: $unit-2;
  margin: $unit-2 0;
  border: $border-width solid $border-color;
  border-radius: $border-radius;
}
</style>
