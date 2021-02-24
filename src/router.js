import { nextTick } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { appStore } from "@/store/app";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Welcome",
      component: () => import("@/views/Welcome.vue"),
      meta: {
        title: "Welcome to Sirius Web Wallet",
      },
    },
    {
      path: "/create",
      name: "CreateWalletSelection",
      component: () => import("@/views/CreateWalletSelection.vue"),
      meta: {
        title: "Select Wallet Creation Type",
      },
    },
    {
      path: "/wallets",
      name: "ViewWallets",
      component: () => import("@/views/ViewWallets.vue"),
      meta: {
        title: "View all wallets stored on device",
      },
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: {
        title: "Wallet Dashboard",
        showOnNav: true,
      },
    },
  ],
});

router.afterEach((to) => {
  nextTick(() => {
    document.title = `ProximaX Sirius ${appStore.name} -
      ${to.meta.title ? to.meta.title : to.name}`;
  });
});

export default router;
