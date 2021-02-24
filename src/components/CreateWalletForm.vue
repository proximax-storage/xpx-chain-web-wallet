<template>
  <form :class="{ 'has-error': err }" @submit.prevent="createWallet">
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
          @click="clearForm"
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
  setup(props) {
    const appStore = inject("appStore");
    const siriusStore = inject("siriusStore");
    const loading = ref(false);
    const err = ref("");
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
      const networkType = await siriusStore.networkHttp
        .getNetworkType()
        .toPromise();

      let result = null;
      if (props.usePrivateKey) {
        result = appStore.addNewWallet(
          walletName.value,
          passwd.value,
          networkType,
          privKey.value
        );
      } else {
        result = appStore.addNewWallet(
          walletName.value,
          passwd.value,
          networkType
        );
      }
      if (result == -1) {
        err.value = "Wallet name exist";
      }

      loading.value = false;
    };

    return {
      loading,
      err,
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
    };
  },
};
</script>
