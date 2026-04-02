<template>
  <div class="forgot-password-container">
    <el-card class="forgot-password-card">
      <h2>重置密码</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="account">
          <el-input v-model="form.account" placeholder="账号" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号" />
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="新密码" />
        </el-form-item>
        <el-form-item prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" placeholder="验证码" style="flex: 1" />
            <img :src="captchaUrl" @click="refreshCaptcha" class="captcha-img" alt="验证码" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleReset" style="width: 100%">重置密码</el-button>
        </el-form-item>
        <div class="footer">
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCaptcha } from '@/api/user'
import request from '@/api/request'

const router = useRouter()
const formRef = ref()
const captchaUrl = ref('')
const form = ref({
  account: '',
  email: '',
  phone: '',
  newPassword: '',
  captchaCode: '',
  captchaId: ''
})

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
  phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const refreshCaptcha = async () => {
  const res = await getCaptcha()
  if (res && res.data) {
    captchaUrl.value = res.data.image || res.data.captchaImage || `data:image/png;base64,${res.data.base64}`
    form.value.captchaId = res.data.id || res.data.captchaId
  }
}

const handleReset = async () => {
  await formRef.value.validate()
  const res = await request.post('/user/reset-password', form.value)
  if (res && res.code === 200) {
    ElMessage.success('密码重置成功')
    router.push('/login')
    return
  }
  const msg = res?.message || ''
  if (msg.includes('账号')) {
    ElMessage.error('账号不存在或已注销')
  } else if (msg.includes('邮箱')) {
    ElMessage.error('邮箱与该账号不匹配')
  } else if (msg.includes('手机号')) {
    ElMessage.error('手机号与该账号不匹配')
  } else {
    ElMessage.error(msg || '重置失败，请重试')
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  background: #fff;
  padding-top: 5vh;
  overflow: hidden;
}

.forgot-password-card {
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
}

.footer a {
  color: #409eff;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
