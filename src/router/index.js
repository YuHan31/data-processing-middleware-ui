import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Upload from '@/views/Upload.vue'
import Tasks from '@/views/Tasks.vue'
import TaskProgress from '@/views/TaskProgress.vue'
import Logs from '@/views/Logs.vue'
import Test from '@/views/Test.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks
  },
  {
    path: '/task-progress',
    name: 'TaskProgress',
    component: TaskProgress
  },
  {
    path: '/logs',
    name: 'Logs',
    component: Logs
  },
  {
    path: '/test',
    name: 'Test',
    component: Test
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
