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
    path: '/auth',
    name: 'auth',
    component: () => import(/* webpackChunkName: "Auth" */ '../views/Auth.vue'),
    meta: {
      requiresNotAuth: true
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
  const isLogged = store.getters['accountStore/isLogged']
  if (requiresAuth && !isLogged) {
    next('/auth')
  } else if (requiresNotAuth && isLogged) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
