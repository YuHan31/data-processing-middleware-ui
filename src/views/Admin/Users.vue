<template>
  <div class="users-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>
      <div class="search-bar">
        <el-input v-model="keyword" placeholder="搜索账号/姓名/邮箱/手机" style="width: 300px" @change="fetchUsers" />
        <el-button type="primary" @click="fetchUsers">搜索</el-button>
      </div>
      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="account" label="账号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" width="200"/>
        <el-table-column prop="phone" label="手机" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'success'">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="toggleUser(row)">
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchUsers"
          @current-change="fetchUsers"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUsers, toggleUser as toggleUserApi } from '@/api/admin'

const users = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers({ page: page.value, size: size.value, keyword: keyword.value })
    if (res.code === 200) {
      users.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const toggleUser = async (row) => {
  try {
    const res = await toggleUserApi(row.id)
    if (res.code === 200) {
      ElMessage.success(res.message || '操作成功')
      fetchUsers()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-manage {
  width: 100%;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.search-bar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>