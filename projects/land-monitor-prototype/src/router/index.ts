import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/monitoring',
  },
  {
    path: '/monitoring',
    component: () => import('../views/monitoring/index.vue'),
  },
  {
    path: '/alerts',
    component: () => import('../views/alerts/index.vue'),
  },
  {
    path: '/evidence',
    component: () => import('../views/evidence/index.vue'),
  },
  {
    path: '/patrol',
    component: () => import('../views/patrol/index.vue'),
  },
  {
    path: '/analysis',
    component: () => import('../views/analysis/index.vue'),
  },
  {
    path: '/settings',
    component: () => import('../views/settings/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
