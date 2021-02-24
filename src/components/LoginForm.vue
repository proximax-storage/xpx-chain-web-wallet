<template>
  <form :class="{ 'has-error': err }" @submit.prevent="login">
    <fieldset :disabled="loading">
      <select v-model="selectedWallet" class="form-select my-2">
        <option
          v-for="item in appStore.state.wallets"
          :key="item.name"
          :value="item.name"
        >
          {{ item.name }}
        </option>
      </select>
      <input
        v-model="passwd"
        type="password"
        class="form-input my-2"
        placeholder="Enter Wallet Password"
        pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"
      />
      <div class="text-center">
        <div v-if="err" class="form-input-hint">{{ err }}</div>
        <button
          type="submit"
          class="btn btn-primary my-2"
          :class="{ loading: loading }"
          :disabled="disableLogin"
        >
          Sign In
        </button>
      </div>
    </fieldset>
  </form>
</template>

<script>
import { computed, inject, ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "LoginForm",
  setup() {
    const appStore = inject("appStore");
    const router = useRouter();
    const passwd = ref("");
    const selectedWallet = ref(appStore.state.wallets[0].name);
    const loading = ref(false);
    const err = ref("");
    const passwdPattern = new RegExp(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"
    );
    const disableLogin = computed(() => !passwd.value.match(passwdPattern));

    const login = () => {
      loading.value = true;
      err.value = "";
      if (disableLogin.value) {
        err.value = "Please enter a valid password";
        loading.value = false;
        return;
      }

      const result = appStore.loginToWallet(selectedWallet.value, passwd.value);
      if (result == -1) {
        err.value = "Invalid wallet name";
      } else if (result == 0) {
        err.value = "Invalid password";
      } else {
        router.push({ path: "/dashboard" });
      }

      loading.value = false;
    };

    return {
      appStore,
      disableLogin,
      err,
      login,
      loading,
      passwd,
      selectedWallet,
    };
  },
};
</script>
