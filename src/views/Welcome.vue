<template>
  <div class="columns text-center">
    <div class="column">
      <img
        src="@/assets/images/icon-blockchain-full-color-80h-proximax-sirius-wallet.svg"
        alt="Blockchain"
        width="150"
      />
      <h4>Blockchain</h4>
      <div>Multisig, aggregated tx, cross chain, metadata.</div>
    </div>
    <div class="column">
      <img
        src="@/assets/images/icon-storage-full-color-80h-proximax-sirius-wallet.svg"
        alt="Storage"
        width="150"
      />
      <h4>Storage</h4>
      <div>P2P decentralised storage for any type of file.</div>
    </div>
    <div class="column">
      <img
        src="@/assets/images/icon-streaming-full-color-80h-proximax-sirius-wallet.svg"
        alt="Streaming"
        width="150"
      />
      <h4>Streaming</h4>
      <div>P2P decentralised streaming for video and chat.</div>
    </div>
    <div class="column">
      <img
        src="@/assets/images/icon-supercontracts-full-color-80h-proximax-sirius-wallet.svg"
        alt="Supercontracts"
        width="150"
      />
      <h4>Supercontracts</h4>
      <div>Easily modifiable digital contracts.</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="columns text-center">
    <div class="column">
      <button
        class="btn btn-primary btn-lg"
        :disabled="appStore.state.wallets.length == 0"
        @click="showLoginModal = true"
      >
        Sign In
      </button>
    </div>
    <div class="column">
      <button class="btn btn-primary btn-lg">Sign In With SiriusID</button>
    </div>
    <div class="column">
      <router-link to="/create" class="btn btn-primary btn-lg">
        Create
      </router-link>
    </div>
  </div>
  <div
    v-if="appStore.state.wallets.length != 0"
    class="modal"
    :class="{ active: showLoginModal }"
  >
    <a
      class="modal-overlay"
      aria-label="Close"
      @click="showLoginModal = false"
    ></a>
    <div class="modal-container">
      <div class="modal-header">
        <a
          class="btn btn-clear float-right"
          aria-label="Close"
          @click="showLoginModal = false"
        ></a>
        <div class="modal-title h5">Sign In</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from "@/components/LoginForm.vue";
import { inject, ref } from "vue";

export default {
  name: "Welcome",
  components: {
    LoginForm,
  },
  setup() {
    const appStore = inject("appStore");
    const showLoginModal = ref(false);

    return {
      appStore,
      showLoginModal,
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
