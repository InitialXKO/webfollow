// Composables
import {
    createRouter,
    createWebHistory
} from 'vue-router'

const routes = [{
    path: '',
    component: () => import('@/views/Home.vue'),
    children: [{
        path: '/:category/:id',
        component: () => import('@/views/Items.vue'),
        props: true
    }, {
        path: '/',
        component: () => import('@/views/Items.vue'),
    }]
}]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
