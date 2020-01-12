import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "Home" */ '../views/Home.vue'),
    meta: {
      requiresNotAuth: true
    }
  }, {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "Home" */ '../views/Dashboard.vue'),
    meta: {
      requiresAuth: true
    }
  }, {
    path: '/select-wallet-creation-type',
    name: 'select-wallet-creation-type',
    component: () => import(/* webpackChunkName: "select-creation-type" */ '../views/wallet/SelectWalletCreationType.vue'),
    meta: {
      requiresNotAuth: true
    }
  }, {
    path: '/create-new-wallet',
    name: 'create-new-wallet',
    component: () => import(/* webpackChunkName: "CreateNew" */ '../views/wallet/CreateNew.vue'),
    meta: {
      requiresNotAuth: true
    }
  }, {
    path: '/create-wallet-from-private-key',
    name: 'create-wallet-from-private-key',
    component: () => import(/* webpackChunkName: "CreateFromPrivateKey" */ '../views/wallet/CreateFromPrivateKey.vue'),
    meta: {
      requiresNotAuth: true
    }
  }, {
    path: '/swap-account-nis1-found',
    name: 'swap-account-nis1-found',
    component: () => import(/* webpackChunkName: "AccountFound" */ '../views/swap/AccountFound.vue'),
    meta: {
      requiresSwap: true
    }
  }, {
    path: '/swap-list-cosigners',
    name: 'swap-list-cosigners',
    component: () => import(/* webpackChunkName: "ListCosigners" */ '../views/swap/ListCosigners.vue'),
    meta: {
      requiresSwap: true
    }
  }, {
    path: '/swap-transfer-assets',
    name: 'swap-transfer-assets',
    component: () => import(/* webpackChunkName: "TransferAssets" */ '../views/swap/TransferAssets.vue'),
    meta: {
      requiresSwap: true
    }
  }, {
    path: '/habla',
    name: 'habla',
    component: () => import(/* webpackChunkName: "TransferAssets" */ '../views/swap/ListCosigners.vue')
  }, {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresNotAuth = to.matched.some(record => record.meta.requiresNotAuth)
  const requiresSwap = to.matched.some(record => record.meta.requiresSwap)
  const isLogged = store.getters['accountStore/isLogged']
  const swapData = store.getters['swapStore/swapData']
  if (requiresSwap) {
    if (swapData) {
      next()
    } else {
      next('/')
    }
  } else {
    if (requiresAuth && !isLogged) {
      next('/')
    } else if (requiresNotAuth && isLogged) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
