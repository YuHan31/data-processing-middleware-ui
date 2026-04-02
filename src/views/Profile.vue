<template>
  <div class="profile">
    <el-card>
      <template #header>
        <h3>个人中心</h3>
      </template>
      <el-form :model="userInfo" label-width="100px">
        <el-form-item label="账号">
          <el-input v-model="userInfo.account" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userInfo.name" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userInfo.nickname" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userInfo.email" disabled />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userInfo.phone" disabled />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const userInfo = ref({
  account: '',
  name: '',
  nickname: '',
  email: '',
  phone: ''
})

const loadUserInfo = async () => {
  const res = await request.get('/user/profile')
  if (res && res.data) {
    userInfo.value = res.data
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 0 auto;
}
</style>
