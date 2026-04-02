<template>
  <div class="tasks-page">
    <el-row :gutter="20">
      <el-col :span="24">
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
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
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
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row.taskId)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
      </el-col>
    </el-row>

    <!-- 启动任务配置对话框 -->
    <el-dialog v-model="configDialogVisible" title="任务配置" width="500px">
      <el-form :model="taskConfig" label-width="120px">
        <el-form-item label="输出格式">
          <el-radio-group v-model="taskConfig.outputFormat">
            <el-radio value="csv">CSV</el-radio>
            <el-radio value="xlsx">XLSX</el-radio>
            <el-radio value="json">JSON</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="输出路径">
          <el-input v-model="taskConfig.outputPath" placeholder="可选，不填则使用默认路径" clearable />
        </el-form-item>
        <el-form-item label="数据清洗">
          <el-switch v-model="taskConfig.enableCleaning" />
        </el-form-item>
        <el-form-item label="数据标准化">
          <el-switch v-model="taskConfig.enableNormalization" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStart">确定启动</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTaskList, startTask, stopTask, deleteTask } from '@/api/task'
import { downloadFile } from '@/api/file'
import { getStatusType, getStatusText, getProgressStatus, canStart, canStop, canDownload } from '@/utils/taskStatus'

const router = useRouter()
const tasks = ref([])
const loading = ref(false)
const configDialogVisible = ref(false)
const currentTaskId = ref('')
const taskConfig = ref({
  outputFormat: 'csv',
  outputPath: '',
  enableCleaning: true,
  enableNormalization: true
})
let refreshTimer = null

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const loadTasks = async () => {
  loading.value = true
  try {
    const res = await getTaskList()
    if (res.code === 200) {
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

const checkTaskChanges = async () => {
  try {
    const res = await getTaskList()
    if (res.code === 200) {
      const newTasks = res.data.tasks || res.data || []

      if (tasks.value.length !== newTasks.length) {
        tasks.value = newTasks
        return
      }

      let hasChanges = false
      for (let i = 0; i < newTasks.length; i++) {
        if (tasks.value[i].taskId !== newTasks[i].taskId ||
            tasks.value[i].status !== newTasks[i].status) {
          hasChanges = true
          break
        }
      }

      if (hasChanges) {
        tasks.value = newTasks
      }
    }
  } catch (error) {
    console.error('检查任务变化失败:', error)
  }
}

const handleStart = async (taskId) => {
  currentTaskId.value = taskId
  configDialogVisible.value = true
}

const confirmStart = async () => {
  try {
    const res = await startTask(currentTaskId.value, taskConfig.value)
    if (res.code === 200) {
      ElMessage.success('任务启动成功')
      configDialogVisible.value = false
      // 保存任务配置，供进度页面使用
      sessionStorage.setItem(`taskConfig_${currentTaskId.value}`, JSON.stringify(taskConfig.value))
      loadTasks()
    } else {
      ElMessage.error(res.message || '启动任务失败')
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
    } else {
      ElMessage.error(res.message || '停止任务失败')
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
    const response = await downloadFile(taskId)
    const disposition = response.headers['content-disposition'] || ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    const filename = match ? match[1] : `result_${taskId}`
    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleDelete = async (taskId) => {
  try {
    await ElMessageBox.confirm('确定要删除此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteTask(taskId)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadTasks()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadTasks()
  refreshTimer = setInterval(checkTaskChanges, 5000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
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

.action-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  overflow-x: auto;
}

.action-buttons::-webkit-scrollbar {
  display: none;
}
</style>
