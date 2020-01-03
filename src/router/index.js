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
    path: '/create-wallet',
    name: 'create-wallet',
    component: () => import(/* webpackChunkName: "createWallet" */ '../views/wallet/CreateWallet.vue'),
    meta: {
      requiresNotAuth: true
    }
  }, {
    path: '/wallet/create-from-private-key',
    name: 'create-from-private-key',
    component: () => import(/* webpackChunkName: "create-wallet-from-private-key" */ '../components/wallet/CreateFromPrivateKey.vue'),
    meta: {
      requiresNotAuth: true
    }
  }, {
    path: '/wallet/create-new',
    name: 'create-wallet-new',
    component: () => import(/* webpackChunkName: "create-wallet-new" */ '../components/wallet/CreateNew.vue'),
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
