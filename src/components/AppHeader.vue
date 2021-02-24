<template>
  <nav class="columns">
    <div class="column text-left">
      <router-link to="/" class="btn btn-link logo d-inline-flex">
        <img
          class="img-responsive"
          src="@/assets/images/logo-name.png"
          alt="ProximaX Sirius Wallet Logo"
          width="150"
        />
        <span class="divider-vert"></span>
        <small class="label text-bold"
          >{{ appStore.name }} v{{ appStore.version }}</small
        >
      </router-link>
    </div>
    <div
      v-if="appStore.state.currentLoggedInWallet"
      class="column col-md-12 text-right"
    >
      <router-link
        v-for="route in $router.options.routes"
        :key="route.path"
        v-slot="{ navigate, href, isActive, isExactActive }"
        :to="route.path"
        custom
      >
        <a
          v-if="route.meta.showOnNav"
          :href="href"
          class="btn btn-link mr-1"
          :class="{
            'text-muted': isActive,
            disabled: isExactActive,
          }"
          @click="navigate"
        >
          {{ route.name }}
        </a>
      </router-link>
      <button class="btn btn-link" @click="logout">Sign Out</button>
      <div class="dropdown dropdown-right">
        <button class="btn btn-link dropdown-toggle" tabindex="0">
          <i class="icon icon-more-vert"></i>
        </button>
        <ul class="menu">
          <li class="menu-item">
            <NodesController />
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="column text-right">
      <router-link to="/" class="btn btn-link mr-1">Home</router-link>
      <router-link
        v-if="appStore.state.wallets.length != 0"
        to="/wallets"
        class="btn btn-link mr-1"
      >
        Wallets
      </router-link>
    </div>
  </nav>
  <div class="column col-12 text-center">
    <h1 class="text-light">{{ $route.meta.title || $route.name }}</h1>
  </div>
</template>
<script>
import { inject } from "vue";
import { useRouter } from "vue-router";
import NodesController from "@/components/NodesController.vue";

export default {
  name: "AppHeader",
  components: {
    NodesController,
  },
  setup() {
    const appStore = inject("appStore");
    const router = useRouter();

    const logout = () => {
      appStore.logoutOfWallet();
      router.push({ path: "/" });
    };

    return {
      appStore,
      logout,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/main";
@import "spectre.css/src/variables";
@import "spectre.css/src/mixins/shadow";
@import "spectre.css/src/menus";
@import "spectre.css/src/dropdowns";

.column {
  margin: $unit-2 0;
  padding: $unit-2;
}

.btn {
  &.btn-link {
    color: $light-color;

    &:focus,
    &:hover {
      color: $gray-color-light;
    }
  }
}

.logo {
  align-items: center;
  -ms-flex-align: center;
}

.menu {
  min-width: $control-width-md;
  color: $body-font-color;
}

@media (max-width: $size-md) {
  .menu {
    min-width: $control-width-sm;
  }
}
</style>
