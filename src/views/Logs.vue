<template>
  <div class="logs-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>日志查看</h2>
          <div class="header-actions">
            <el-input
              v-model="inputTaskId"
              placeholder="请输入任务ID"
              style="width: 300px; margin-right: 10px;"
              @keyup.enter="loadLogs"
            >
              <template #prepend>任务ID</template>
            </el-input>
            <el-button type="primary" @click="loadLogs">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="refreshLogs" :disabled="!currentTaskId">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="!currentTaskId" class="no-task">
        <el-empty description="请输入任务ID查看日志" />
      </div>

      <div v-else class="log-content">
        <div class="log-header">
          <span>任务ID: {{ currentTaskId }}</span>
          <el-tag>共 {{ logs.length }} 条日志</el-tag>
        </div>

        <div class="log-console" ref="logConsole">
          <div v-if="logs.length === 0" class="no-logs">
            暂无日志信息
          </div>
          <div v-else>
            <div
              v-for="(log, index) in logs"
              :key="index"
              :class="['log-line', getLogClass(log)]"
            >
              {{ log }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTaskLog } from '@/api/log'

const route = useRoute()
const inputTaskId = ref(route.query.taskId || '')
const currentTaskId = ref('')
const logs = ref([])
const logConsole = ref(null)

const loadLogs = async () => {
  if (!inputTaskId.value) {
    ElMessage.warning('请输入任务ID')
    return
  }

  try {
    const res = await getTaskLog(inputTaskId.value)
    if (res.code === 200) {
      currentTaskId.value = inputTaskId.value
      logs.value = res.data || []
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    ElMessage.error('加载日志失败')
  }
}

const refreshLogs = () => {
  if (currentTaskId.value) {
    inputTaskId.value = currentTaskId.value
    loadLogs()
  }
}

const getLogClass = (log) => {
  if (log.includes('[ERROR]') || log.includes('[FAILED]')) {
    return 'log-error'
  }
  if (log.includes('[WARN]')) {
    return 'log-warn'
  }
  if (log.includes('[INFO]')) {
    return 'log-info'
  }
  if (log.includes('[SUCCESS]')) {
    return 'log-success'
  }
  return 'log-default'
}

const scrollToBottom = () => {
  if (logConsole.value) {
    logConsole.value.scrollTop = logConsole.value.scrollHeight
  }
}

onMounted(() => {
  if (inputTaskId.value) {
    loadLogs()
  }
})
</script>

<style scoped>
.logs-page {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.card-header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

.no-task {
  padding: 60px 0;
}

.log-content {
  padding: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
}

.log-console {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 20px;
  border-radius: 4px;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  max-height: 600px;
  overflow-y: auto;
}

.no-logs {
  color: #888;
  text-align: center;
  padding: 40px 0;
}

.log-line {
  padding: 4px 0;
  word-wrap: break-word;
}

.log-error {
  color: #f56c6c;
}

.log-warn {
  color: #e6a23c;
}

.log-info {
  color: #409eff;
}

.log-success {
  color: #67c23a;
}

.log-default {
  color: #d4d4d4;
}

.log-console::-webkit-scrollbar {
  width: 8px;
}

.log-console::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.log-console::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.log-console::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>
