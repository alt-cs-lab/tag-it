// Libraries 
import { createRouter, createWebHistory } from 'vue-router'

// Views
import HomeView from '../views/HomeView.vue'
import ProjectView from '../views/ProjectView.vue'
import DocumentsView from '../views/DocumentView.vue'

// Stores 
import { useTokenStore } from '@/stores/token'
import Logger from 'js-logger'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectView,
    },
    {
      path: '/projects/:projectId/documents/:documentId',
      name: 'documents',
      component: DocumentsView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

/**
 * Global route guard - user must be logged in to view any page other than home
 */
router.beforeEach(async function (to) {
  if (to.name !== 'home') {
    const tokenStore = useTokenStore()
    if (!tokenStore.token) {
      await tokenStore.getToken()
      Logger.log("FOUND TOKEN" , {token: tokenStore.token})
    }
    if (!tokenStore.token) {
      return '/'
    }
  }
})


export default router
