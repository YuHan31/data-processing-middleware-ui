<template>
  <div class="tasks-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务管理</span>
        </div>
      </template>
      <div class="search-bar">
        <el-select v-model="status" placeholder="任务状态" clearable style="width: 150px" @change="fetchTasks">
          <el-option label="全部" value="" />
          <el-option label="已上传" value="UPLOADED" />
          <el-option label="运行中" value="RUNNING" />
          <el-option label="已完成" value="FINISHED" />
          <el-option label="失败" value="FAILED" />
          <el-option label="已停止" value="STOPPED" />
        </el-select>
        <el-input v-model="userId" placeholder="用户ID" style="width: 150px" @change="fetchTasks" />
        <el-button type="primary" @click="fetchTasks">搜索</el-button>
      </div>
      <el-table :data="tasks" v-loading="loading" stripe>
        <el-table-column prop="id" label="任务ID" width="100" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户姓名" width="120" />
        <el-table-column prop="taskName" label="任务名称" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="100" />
        <el-table-column prop="outputFormat" label="输出格式" width="100" />
        <el-table-column prop="fileSize" label="文件大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="info" size="small" @click="viewRules(row)">清洗规则</el-button>
              <el-button type="primary" size="small" @click="viewLogs(row)">日志</el-button>
            </div>
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
          @size-change="fetchTasks"
          @current-change="fetchTasks"
        />
      </div>
    </el-card>

    <!-- 清洗规则弹窗 -->
    <el-dialog v-model="rulesDialogVisible" title="任务清洗规则" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="任务ID">{{ currentTask?.taskId }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask?.taskName }}</el-descriptions-item>
        <el-descriptions-item label="清洗规则">
          <el-tag v-for="rule in taskRules" :key="rule" style="margin-right: 5px">{{ getRuleName(rule) }}</el-tag>
          <span v-if="taskRules.length === 0">无</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 日志弹窗 -->
    <el-dialog v-model="logsDialogVisible" title="任务日志" width="900px">
      <el-empty v-if="logs.length === 0" description="暂无日志" />
      <div v-else class="log-list">
        <div v-for="log in logs" :key="log.id" class="log-item" :class="'log-' + log.level.toLowerCase()">
          <div class="log-header">
            <el-tag :type="getLogLevelType(log.level)" size="small">{{ log.level }}</el-tag>
            <span class="log-stage">{{ log.stage }}</span>
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          </div>
          <div class="log-message">{{ log.message }}</div>
          <div class="log-user-message">{{ log.userMessage }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllTasks, getTaskRules, getTaskLogs } from '@/api/admin'

const tasks = ref([])
const loading = ref(false)
const status = ref('')
const userId = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)

const rulesDialogVisible = ref(false)
const logsDialogVisible = ref(false)
const currentTask = ref(null)
const taskRules = ref([])
const logs = ref([])

// 清洗规则代码到中文名称的映射
const ruleNames = {
  TRIM: '去除空格',
  REMOVE_NULL: '删除空值',
  DEDUPLICATE: '去除重复',
  TO_UPPER: '转换为大写',
  TO_LOWER: '转换为小写',
  PHONE_MASK: '手机号脱敏',
  EMAIL_MASK: '邮箱脱敏',
  DATA_MASK: '数据脱敏',
  NORMALIZE_DATE: '日期标准化',
  REMOVE_EMPTY_ROW: '删除空行'
}

const getRuleName = (code) => {
  return ruleNames[code] || code
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (status.value) params.status = status.value
    if (userId.value) params.userId = userId.value
    const res = await getAllTasks(params)
    if (res.code === 200) {
      tasks.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = { UPLOADED: '', RUNNING: 'warning', FINISHED: 'success', FAILED: 'danger', STOPPED: 'info' }
  return map[status] || ''
}

const getStatusText = (status) => {
  const map = { UPLOADED: '已上传', RUNNING: '运行中', FINISHED: '已完成', FAILED: '失败', STOPPED: '已停止' }
  return map[status] || status
}

const viewRules = async (row) => {
  currentTask.value = row
  taskRules.value = []
  try {
    const res = await getTaskRules(row.taskId)
    if (res.code === 200) {
      taskRules.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取任务规则失败')
    }
  } catch (e) {
    taskRules.value = []
    ElMessage.error('获取任务规则失败')
  }
  rulesDialogVisible.value = true
}

const viewLogs = async (row) => {
  currentTask.value = row
  try {
    const res = await getTaskLogs(row.taskId)
    if (res.code === 200) {
      logs.value = res.data || []
    }
  } catch (e) {
    logs.value = []
  }
  logsDialogVisible.value = true
}

const getLogLevelType = (level) => {
  const map = { INFO: '', WARN: 'warning', ERROR: 'danger' }
  return map[level] || ''
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return size.toFixed(2) + ' ' + units[index]
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.tasks-manage {
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

.log-list {
  max-height: 500px;
  overflow-y: auto;
}

.log-item {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  background: #f5f5f5;
}

.log-error {
  background: #fff2f0;
  border-left: 3px solid #ff4d4f;
}

.log-warn {
  background: #fffbe6;
  border-left: 3px solid #faad14;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.log-stage {
  color: #666;
  font-size: 12px;
}

.log-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.log-message {
  font-family: monospace;
  font-size: 13px;
  color: #333;
}

.log-user-message {
  margin-top: 5px;
  color: #666;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 5px;
}
</style>
