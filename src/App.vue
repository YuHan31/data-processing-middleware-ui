<template>
  <el-container class="app-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>数据处理系统</h2>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#f0f2f5"
        text-color="#333333"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/upload">
          <el-icon><Upload /></el-icon>
          <span>文件上传</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        <el-menu-item index="/task-progress">
          <el-icon><Loading /></el-icon>
          <span>任务进度</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <span>日志查看</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <h3>数据处理中间件系统</h3>
        <div class="header-actions">
          <div v-if="!isLoggedIn">
            <el-button type="primary" size="small" @click="$router.push('/login')">登录</el-button>
            <el-button type="success" size="small" @click="$router.push('/register')">注册</el-button>
          </div>
          <el-dropdown v-else>
            <span class="user-info">
              {{ username }} <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isLoggedIn = ref(false)
const username = ref('')

const checkLogin = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('username')
  if (token && user) {
    isLoggedIn.value = true
    username.value = user
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  username.value = ''
  ElMessage.success('已退出登录')
  router.push('/login')
}

onMounted(() => {
  checkLogin()
})

router.afterEach(() => {
  checkLogin()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.app-container {
  height: 100vh;
}

.sidebar {
  background-color: #f0f2f5;
  height: 100vh;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
}

.logo h2 {
  color: #333333;
  font-size: 18px;
}

.header {
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
}

.header h3 {
  color: #333;
  font-size: 20px;
}

.main-content {
  background-color: #ffffff;
  padding: 20px;
  overflow: hidden;
}
</style>
