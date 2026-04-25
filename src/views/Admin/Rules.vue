<template>
  <div class="rules-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>清洗规则管理</span>
        </div>
      </template>
      <el-table :data="rules" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="ruleCode" label="规则代码" width="150" />
        <el-table-column prop="ruleName" label="规则名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="ruleType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.ruleType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === 'basic' ? '' : 'warning'" size="small">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="displayOrder" label="排序" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editRule(row)">编辑</el-button>
            <el-button :type="row.enabled ? 'warning' : 'success'" size="small" @click="toggleRule(row)">
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑规则" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="规则代码">
          <el-input v-model="editForm.ruleCode" disabled />
        </el-form-item>
        <el-form-item label="规则名称">
          <el-input v-model="editForm.ruleName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="editForm.displayOrder" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCleanRules, updateCleanRule, deleteCleanRule, toggleCleanRule } from '@/api/admin'

const rules = ref([])
const loading = ref(false)

const editDialogVisible = ref(false)
const editForm = ref({
  id: null,
  ruleCode: '',
  ruleName: '',
  description: '',
  displayOrder: 10
})

const fetchRules = async () => {
  loading.value = true
  try {
    const res = await getCleanRules()
    if (res.code === 200) {
      rules.value = res.data || []
    }
  } catch (e) {
    ElMessage.error('获取规则列表失败')
  } finally {
    loading.value = false
  }
}

const editRule = (row) => {
  editForm.value = {
    id: row.id,
    ruleCode: row.ruleCode,
    ruleName: row.ruleName,
    description: row.description,
    displayOrder: row.displayOrder
  }
  editDialogVisible.value = true
}

const submitEdit = async () => {
  try {
    const res = await updateCleanRule(editForm.value.id, {
      ruleName: editForm.value.ruleName,
      description: editForm.value.description,
      displayOrder: editForm.value.displayOrder
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
      editDialogVisible.value = false
      fetchRules()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const toggleRule = async (row) => {
  try {
    const res = await toggleCleanRule(row.id)
    if (res.code === 200) {
      ElMessage.success(res.message || '操作成功')
      fetchRules()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const deleteRule = async (row) => {
  await ElMessageBox.confirm(`确定要删除规则 "${row.ruleName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    const res = await deleteCleanRule(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchRules()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    // 用户取消不报错
  }
}

onMounted(() => {
  fetchRules()
})
</script>

<style scoped>
.rules-manage {
  width: 100%;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>