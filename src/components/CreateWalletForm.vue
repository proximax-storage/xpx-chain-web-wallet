<template>
  <form
    v-if="!newWallet"
    :class="{ 'has-error': err }"
    @submit.prevent="createWallet"
  >
    <fieldset :disabled="loading">
      <div v-if="usePrivateKey" class="form-group">
        <div class="col-3 col-sm-12 m-2">
          <label class="form-label">Private Key</label>
        </div>
        <div class="col-9 col-sm-12 m-2">
          <input
            v-model="privKey"
            type="password"
            class="form-input"
            :disabled="loading"
            placeholder="Private Key"
            :pattern="privKeyPattern"
          />
        </div>
        <div class="col-9 col-sm-12 col-ml-auto m-2">
          <label class="form-switch">
            <input v-model="nis1Swap" type="checkbox" />
            <i class="form-icon"></i> NIS 1 Swap
          </label>
        </div>
      </div>
      <div class="col-3 col-sm-12 m-2">
        <label class="form-label">Wallet Name</label>
      </div>
      <div class="col-9 col-sm-12 m-2">
        <input
          v-model="walletName"
          type="text"
          class="form-input"
          :disabled="loading"
          placeholder="Wallet Name"
        />
      </div>
      <div class="col-3 col-sm-12 m-2">
        <label class="form-label">Password</label>
      </div>
      <div class="col-9 col-sm-12 m-2">
        <input
          v-model="passwd"
          type="password"
          class="form-input"
          :disabled="loading"
          placeholder="New Password"
          :pattern="passwdPattern"
        />
      </div>
      <div class="col-3 col-sm-12 m-2">
        <label class="form-label">Confirm Password</label>
      </div>
      <div class="col-9 col-sm-12 m-2">
        <input
          v-model="confirmPassword"
          type="password"
          class="form-input"
          :disabled="passwd === '' || loading"
          placeholder="Confirm New Password"
          :pattern="passwdPattern"
        />
      </div>
      <div class="col-12 m-2">
        <button
          type="button"
          class="btn btn-primary mr-2"
          :disabled="loading"
          @click="clearForm()"
        >
          Clear
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :class="{ loading: loading }"
          :disabled="disableCreate"
        >
          Create
        </button>
      </div>
      <div v-if="err" class="form-input-hint">{{ err }}</div>
    </fieldset>
  </form>
  <div v-else class="empty">
    <div class="empty-icon">
      <i class="icon icon-3x icon-check"></i>
    </div>
    <p class="empty-title h5">
      Wallet {{ newWallet.name }} created successfully
    </p>
    <div class="empty-subtitle">
      <div class="input-group">
        <span class="input-group-addon">Address</span>
        <input
          id="address"
          class="form-input"
          type="text"
          disabled
          :value="newWallet.accounts[0].address"
        />
        <button class="btn btn-action input-group-btn" @click="copy('address')">
          <i class="icon icon-copy"></i>
        </button>
      </div>
    </div>
    <div class="empty-action">
      <button
        class="btn btn-primary"
        @click="
          newWallet = null;
          clearForm();
          $emit('close');
        "
      >
        Close
      </button>
    </div>
  </div>
</template>

<script>
import { computed, inject, ref } from "vue";

export default {
  name: "CreateWalletForm",
  props: {
    usePrivateKey: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  setup(props) {
    const appStore = inject("appStore");
    const siriusStore = inject("siriusStore");
    const loading = ref(false);
    const err = ref("");
    const newWallet = ref(null);
    const walletName = ref("");
    const passwd = ref("");
    const confirmPassword = ref("");
    const nis1Swap = ref(false);
    const privKey = ref("");

    const passwdPattern = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$";
    const privKeyPattern = "^(0x|0X)?[a-fA-F0-9].{63,65}$";

    const disableCreate = computed(
      () =>
        !(
          walletName.value !== "" &&
          passwd.value.match(passwdPattern) &&
          confirmPassword.value === passwd.value &&
          (!props.usePrivateKey ||
            (props.usePrivateKey && privKey.value.match(privKeyPattern)))
        )
    );

    const clearForm = () => {
      walletName.value = "";
      passwd.value = "";
      confirmPassword.value = "";
      if (props.usePrivateKey) {
        nis1Swap.value = false;
        privKey.value = "";
      }
    };

    const createWallet = async () => {
      loading.value = true;
      err.value = "";
      let result = 0;

      if (props.usePrivateKey) {
        result = appStore.addNewWallet(
          walletName.value,
          passwd.value,
          siriusStore.state.network.type,
          privKey.value
        );
      } else {
        result = appStore.addNewWallet(
          walletName.value,
          passwd.value,
          siriusStore.state.network.type
        );
      }
      if (result === -1) {
        err.value = "Wallet name exist";
      } else if (result === 0) {
        err.value =
          "Unable to create wallet. Your device storage might be full";
      } else {
        newWallet.value =
          appStore.state.wallets[appStore.state.wallets.length - 1];
      }

      loading.value = false;
    };

    const copy = (id) => {
      // Credits: https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
      var copyText = document.getElementById(id);

      /* Select the text field */
      copyText.select();
      copyText.setSelectionRange(0, 99999); /* For mobile devices */

      /* Copy the text inside the text field */
      document.execCommand("copy");

      /* Alert the copied text */
      alert("Copied " + id + ": " + copyText.value);
    };

    return {
      loading,
      err,
      newWallet,
      walletName,
      passwd,
      confirmPassword,
      nis1Swap,
      privKey,
      passwdPattern,
      privKeyPattern,
      disableCreate,
      clearForm,
      createWallet,
      copy,
    };
  },
};
</script>
