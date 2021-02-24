<template>
  <div class="columns text-center">
    <div class="column">
      <img
        src="@/assets/images/icon-add-new-blue.svg"
        alt="New Wallet"
        width="150"
      />
      <h4>New Wallet</h4>
      <button
        class="btn btn-primary btn-lg"
        @click="
          usePrivateKey = false;
          showCreateModal = true;
        "
      >
        Create
      </button>
    </div>
    <div class="column">
      <img
        src="@/assets/images/icon-private-key-blue.svg"
        alt="From a Private Key"
        width="150"
      />
      <h4>From a Private Key</h4>
      <button
        class="btn btn-primary btn-lg"
        @click="
          usePrivateKey = true;
          showCreateModal = true;
        "
      >
        Create
      </button>
    </div>
    <div class="column">
      <img
        src="@/assets/images/icon-wallet-import-blue.svg"
        alt="From a Wallet Backup"
        width="150"
      />
      <h4>From a Wallet Backup</h4>
      <button class="btn btn-primary btn-lg">Import</button>
    </div>
  </div>
  <div class="modal" :class="{ active: showCreateModal }">
    <a
      class="modal-overlay"
      aria-label="Close"
      @click="showCreateModal = false"
    ></a>
    <div class="modal-container">
      <div class="modal-header">
        <a
          class="btn btn-clear float-right"
          aria-label="Close"
          @click="showCreateModal = false"
        ></a>
        <div class="modal-title h5">
          Create Wallet {{ usePrivateKey ? "(with Private Key)" : "(New)" }}
        </div>
      </div>
      <div class="modal-body">
        <div class="content">
          <CreateWalletForm :use-private-key="usePrivateKey" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreateWalletForm from "@/components/CreateWalletForm.vue";
import { ref } from "vue";

export default {
  name: "CreateWalletSelection",
  components: {
    CreateWalletForm,
  },
  setup() {
    const showCreateModal = ref(false);
    const usePrivateKey = ref(false);

    return {
      showCreateModal,
      usePrivateKey,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "spectre.css/src/variables";
@import "spectre.css/src/mixins/shadow";
@import "spectre.css/src/modals";

.column {
  margin: $unit-6 0;
}
</style>
