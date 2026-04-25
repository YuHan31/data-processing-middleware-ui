<template>
  <div class="logs-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>日志管理</span>
        </div>
      </template>
      <div class="search-bar">
        <el-select v-model="level" placeholder="日志级别" clearable style="width: 150px" @change="fetchLogs">
          <el-option label="全部" value="" />
          <el-option label="INFO" value="INFO" />
          <el-option label="WARN" value="WARN" />
          <el-option label="ERROR" value="ERROR" />
        </el-select>
        <el-button type="primary" @click="fetchLogs">刷新</el-button>
      </div>
      <el-table :data="logs" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stage" label="阶段" width="150">
          <template #default="{ row }">
            {{ row.stage }}
          </template>
        </el-table-column>
        <el-table-column prop="taskId" label="任务ID" min-width="200" />
        <el-table-column prop="userMessage" label="用户消息" min-width="200" />
        <el-table-column prop="timestamp" label="时间" width="300">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchLogs"
          @current-change="fetchLogs"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="日志详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentLog?.id }}</el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="getLevelType(currentLog?.level)">{{ currentLog?.level }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="阶段">{{ getStageText(currentLog?.stage) }}</el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ currentLog?.taskId }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ formatTime(currentLog?.timestamp) }}</el-descriptions-item>
        <el-descriptions-item label="用户消息">{{ currentLog?.userMessage }}</el-descriptions-item>
        <el-descriptions-item label="系统消息">{{ currentLog?.message }}</el-descriptions-item>
        <el-descriptions-item v-if="currentLog?.exceptionMessage" label="异常信息">
          {{ currentLog?.exceptionMessage }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-if="currentLog?.stackTrace" class="stack-trace">
        <pre>{{ currentLog.stackTrace }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllLogs } from '@/api/admin'

const logs = ref([])
const loading = ref(false)
const level = ref('')
const page = ref(1)
const size = ref(100)
const total = ref(0)

const detailDialogVisible = ref(false)
const currentLog = ref(null)

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    const res = await getAllLogs(params)
    console.log('日志接口返回:', res)
    if (res.code === 200) {
      let logList = res.data || []
      // 前端筛选级别（因为接口不支持按级别筛选）
      if (level.value) {
        logList = logList.filter(log => log.level === level.value)
      }
      logs.value = logList
      total.value = logList.length
    }
  } catch (e) {
    ElMessage.error('获取日志列表失败')
  } finally {
    loading.value = false
  }
}

const getLevelType = (level) => {
  const map = { INFO: '', WARN: 'warning', ERROR: 'danger' }
  return map[level] || ''
}

const getStageText = (stage) => {
  const map = { PARSE: '解析', CLEAN: '清洗', EXPORT: '导出', PARSING: '解析', CLEANING: '清洗', EXPORTING: '导出' }
  return map[stage] || stage || ''
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const viewDetail = (row) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.logs-manage {
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

.stack-trace {
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}

.stack-trace pre {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>