import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Upload from '@/views/Upload.vue'
import Tasks from '@/views/Tasks.vue'
import TaskDetail from '@/views/TaskDetail.vue'
import Test from '@/views/Test.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import AdminLayout from '@/views/Admin/index.vue'
import AdminUsers from '@/views/Admin/Users.vue'
import AdminTasks from '@/views/Admin/Tasks.vue'
import AdminLogs from '@/views/Admin/Logs.vue'
import AdminRules from '@/views/Admin/Rules.vue'
import UserLayout from '@/components/UserLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  // 管理员路由 - 独立布局
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: 'users', name: 'AdminUsers', component: AdminUsers },
      { path: 'tasks', name: 'AdminTasks', component: AdminTasks },
      { path: 'logs', name: 'AdminLogs', component: AdminLogs },
      { path: 'rules', name: 'AdminRules', component: AdminRules }
    ]
  },
  // 普通用户路由 - 独立布局
  {
    path: '/',
    component: UserLayout,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'upload', name: 'Upload', component: Upload },
      { path: 'tasks', name: 'Tasks', component: Tasks },
      { path: 'task-detail', name: 'TaskDetail', component: TaskDetail },
      { path: 'test', name: 'Test', component: Test },
      { path: 'profile', name: 'Profile', component: Profile }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // 检查是否是管理员路由
  if (to.path.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      // 非管理员访问管理页面，重定向到首页
      next('/')
    } else {
      next()
    }
    return
  }

  if (!token && to.path !== '/login' && to.path !== '/register' && to.path !== '/forgot-password') {
    next('/login')
  } else if (token && (to.path === '/login' || to.path === '/register')) {
    // 已登录用户访问登录/注册页，根据角色跳转
    if (role === 'ADMIN') {
      next('/admin/users')
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
