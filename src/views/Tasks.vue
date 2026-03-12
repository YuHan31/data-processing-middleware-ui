<template>
  <div class="tasks-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>任务管理</h2>
          <el-button type="primary" @click="loadTasks">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="tasks" style="width: 100%" v-loading="loading">
        <el-table-column prop="taskId" label="任务ID" width="180" />
        <el-table-column prop="taskName" label="任务名称" min-width="200" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处理进度" width="180">
          <template #default="{ row }">
            <div v-if="row.processedRecords !== null">
              {{ row.processedRecords || 0 }} 条
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ row.startTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="canStart(row.status)"
              type="success"
              size="small"
              @click="handleStart(row.taskId)"
            >
              启动任务
            </el-button>
            <el-button
              v-if="canStop(row.status)"
              type="warning"
              size="small"
              @click="handleStop(row.taskId)"
            >
              停止任务
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleViewProgress(row.taskId)"
            >
              查看进度
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleViewLog(row.taskId)"
            >
              查看日志
            </el-button>
            <el-button
              v-if="canDownload(row.status)"
              type="success"
              size="small"
              @click="handleDownload(row.taskId)"
            >
              下载结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTaskList, startTask, stopTask } from '@/api/task'
import { downloadFile } from '@/api/file'
import { getStatusType, getStatusText, getProgressStatus, canStart, canStop, canDownload } from '@/utils/taskStatus'

const router = useRouter()
const tasks = ref([])
const loading = ref(false)

const loadTasks = async () => {
  loading.value = true
  try {
    const res = await getTaskList()
    if (res.code === 200) {
      // 适配分页数据结构
      tasks.value = res.data.tasks || res.data || []
    } else {
      ElMessage.error(`加载失败: ${res.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
    ElMessage.error(`加载任务列表失败: ${error.message || '请检查后端服务是否启动'}`)
  } finally {
    loading.value = false
  }
}

const handleStart = async (taskId) => {
  try {
    await ElMessageBox.confirm('确定要启动此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await startTask(taskId)
    if (res.code === 200) {
      ElMessage.success('任务启动成功')
      loadTasks()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('启动任务失败')
    }
  }
}

const handleStop = async (taskId) => {
  try {
    await ElMessageBox.confirm('确定要停止此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await stopTask(taskId)
    if (res.code === 200) {
      ElMessage.success('任务已停止')
      loadTasks()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('停止任务失败')
    }
  }
}

const handleViewProgress = (taskId) => {
  router.push(`/task-progress?taskId=${taskId}`)
}

const handleViewLog = (taskId) => {
  router.push(`/logs?taskId=${taskId}`)
}

const handleDownload = async (taskId) => {
  try {
    const blob = await downloadFile(taskId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `result_${taskId}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.tasks-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}
</style>
