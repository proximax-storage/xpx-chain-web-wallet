<template>
  <div class="columns">
    <div class="column col-6">
      <LoadingState v-if="!accountInfo" />
      <ErrorState v-else-if="accountInfo.err" :err="accountInfo.err" />
      <AccountCard v-else :account-info="accountInfo" />
    </div>
  </div>
</template>

<script>
import AccountCard from "@/components/AccountCard.vue";
import ErrorState from "@/components/ErrorState.vue";
import LoadingState from "@/components/LoadingState.vue";
import { inject, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Address } from "tsjs-xpx-chain-sdk";

export default {
  name: "Dashboard",
  components: {
    AccountCard,
    ErrorState,
    LoadingState,
  },
  setup() {
    const appStore = inject("appStore");
    const siriusStore = inject("siriusStore");
    const accountInfo = ref(null);

    const getAccountInfo = async () => {
      if (!appStore.state.currentLoggedInWallet) {
        useRouter().replace({ path: "/" });
        return;
      }

      try {
        accountInfo.value = await siriusStore.accountHttp
          .getAccountInfo(
            Address.createFromRawAddress(
              appStore.state.loggedInWalletFirstAccount.address
            )
          )
          .toPromise();
      } catch (err) {
        console.error("Account Error", err);
        accountInfo.value = {
          err: "Unable to fetch account info from selected node",
        };
      }
    };

    watch(
      () => siriusStore.state.selectedChainNode,
      async () => {
        await getAccountInfo();
      }
    );

    getAccountInfo();

    return {
      accountInfo,
    };
  },
};
</script>
