<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2>注册</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="account">
          <el-input v-model="form.account" placeholder="账号" />
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-model="form.name" placeholder="姓名" />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号" />
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
          <el-button type="primary" @click="handleRegister" style="width: 100%">注册</el-button>
        </el-form-item>
        <div class="footer">
          <router-link to="/login">已有账号？去登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, getCaptcha, checkUnique } from '@/api/user'

const router = useRouter()
const formRef = ref()
const captchaUrl = ref('')
const form = ref({
  account: '',
  name: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  captchaCode: '',
  captchaId: ''
})

const validateUnique = (field) => {
  return async (rule, value, callback) => {
    if (!value) {
      callback()
      return
    }
    try {
      const res = await checkUnique(field, value)
      if (res && res.data && !res.data.unique) {
        callback(new Error(`该${field === 'account' ? '账号' : field === 'email' ? '邮箱' : '手机号'}已被注册`))
      } else {
        callback()
      }
    } catch {
      callback()
    }
  }
}

const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { validator: validateUnique('account'), trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, type: 'email', message: '请输入正确的邮箱', trigger: 'blur' },
    { validator: validateUnique('email'), trigger: 'blur' }
  ],
  phone: [
    { required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    { validator: validateUnique('phone'), trigger: 'blur' }
  ],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
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

const handleRegister = async () => {
  await formRef.value.validate()
  const res = await register(form.value)
  if (res.success) {
    ElMessage.success('注册成功')
    router.push('/login')
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: #fff;
  padding-top: 0vh;
  overflow: hidden;
}

.register-card {
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
</style>
