<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>登录</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="loginId">
          <el-input v-model="form.loginId" placeholder="账号/邮箱/手机号" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-form-item prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" placeholder="验证码" style="flex: 1" />
            <img :src="captchaUrl" @click="refreshCaptcha" class="captcha-img" alt="验证码" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
        <div class="footer">
          <router-link to="/register">还没有账号？去注册</router-link>
          <router-link to="/forgot-password">忘记密码？</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, getCaptcha } from '@/api/user'

const router = useRouter()
const formRef = ref()
const captchaUrl = ref('')
const form = ref({
  loginId: '',
  password: '',
  captchaCode: '',
  captchaId: ''
})

const rules = {
  loginId: [{ required: true, message: '请输入账号/邮箱/手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const refreshCaptcha = async () => {
  const res = await getCaptcha()
  console.log('验证码返回数据:', res)
  if (res && res.data) {
    captchaUrl.value = res.data.image || res.data.captchaImage || `data:image/png;base64,${res.data.base64}`
    form.value.captchaId = res.data.id || res.data.captchaId
  }
}

const handleLogin = async () => {
  await formRef.value.validate()
  console.log('提交的登录数据:', form.value)
  const res = await login(form.value)
  console.log('登录返回:', res)
  if (res.code === 200) {
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.nickname || res.data.username || form.value.loginId)
    localStorage.setItem('userId', res.data.userId)
    localStorage.setItem('role', res.data.role || 'USER')
    ElMessage.success('登录成功')
    // 根据角色跳转
    if (res.data.role === 'ADMIN') {
      router.push('/admin/users')
    } else {
      router.push('/')
    }
  } else {
    ElMessage.error(res.message || '登录失败')
    refreshCaptcha()
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  background: #fff;
  padding-top: 0vh;
  overflow: hidden;
}

.login-card {
  width: 400px;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.captcha-row {
  display: flex;
  gap: 10px;
}

.captcha-img {
  width: 120px;
  height: 40px;
  cursor: pointer;
}

.footer {
  text-align: center;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
