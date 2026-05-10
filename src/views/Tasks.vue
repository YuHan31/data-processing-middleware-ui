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
        <el-table-column label="操作" width="280" fixed="right">
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
                @click="handleViewDetail(row.taskId)"
              >
                查看详情
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
    <el-dialog v-model="configDialogVisible" title="任务配置" width="640px" destroy-on-close>
      <el-form :model="taskConfig" label-width="100px">
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
      </el-form>

      <!-- 清洗规则选择区 -->
      <div class="rules-section">
        <div class="rules-header">
          <span class="rules-title">清洗规则</span>
          <el-tooltip content="选择需要应用的清洗规则，可拖拽调整执行顺序" placement="top">
            <el-icon class="rules-tip"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>

        <!-- 加载状态 -->
        <div v-if="rulesLoading" class="rules-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载规则中...</span>
        </div>

        <template v-else>
          <!-- 基础规则 -->
          <div class="rules-group" v-if="basicRules.length > 0">
            <div class="rules-group-label">
              <el-icon><Tools /></el-icon>
              基础规则
            </div>
            <el-checkbox-group v-model="selectedRules">
              <el-tooltip
                v-for="rule in basicRules"
                :key="rule.code"
                :content="rule.description || rule.descriptionCn || '暂无说明'"
                placement="top"
                :disabled="!rule.description && !rule.descriptionCn"
              >
                <el-checkbox :value="rule.code" :label="rule.code" class="rule-checkbox">
                  {{ rule.name || rule.nameCn || rule.code }}
                </el-checkbox>
              </el-tooltip>
            </el-checkbox-group>
          </div>

          <!-- 高级规则 -->
          <div class="rules-group" v-if="advancedRules.length > 0">
            <div class="rules-group-label">
              <el-icon><Setting /></el-icon>
              高级规则
            </div>
            <el-checkbox-group v-model="selectedRules">
              <el-tooltip
                v-for="rule in advancedRules"
                :key="rule.code"
                :content="rule.description || rule.descriptionCn || '暂无说明'"
                placement="top"
                :disabled="!rule.description && !rule.descriptionCn"
              >
                <el-checkbox :value="rule.code" :label="rule.code" class="rule-checkbox">
                  {{ rule.name || rule.nameCn || rule.code }}
                </el-checkbox>
              </el-tooltip>
            </el-checkbox-group>
          </div>

          <!-- 已选规则拖拽排序 -->
          <div class="rules-order" v-if="selectedRules.length > 0">
            <div class="rules-group-label">
              <el-icon><Rank /></el-icon>
              执行顺序（拖拽调整）
            </div>
            <draggable
              v-model="selectedRules"
              item-key="code"
              class="rules-drag-list"
              ghost-class="ghost"
              chosen-class="chosen"
            >
              <template #item="{ element }">
                <div class="drag-item">
                  <el-icon class="drag-icon"><Rank /></el-icon>
                  <span>{{ getRuleName(element) }}</span>
                </div>
              </template>
            </draggable>
          </div>

          <div v-if="rules.length === 0" class="rules-empty">
            暂无可用规则
          </div>
        </template>
      </div>

      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStart">确定启动</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import { getTaskList, startTask, stopTask, deleteTask, getCleanRules } from '@/api/task'
import { downloadFile } from '@/api/file'
import { getStatusType, getStatusText, canStart, canStop, canDownload } from '@/utils/taskStatus'

const router = useRouter()
const tasks = ref([])
const loading = ref(false)
const taskPage = ref(1)
const taskPageSize = ref(100)
const configDialogVisible = ref(false)
const currentTaskId = ref('')
const taskConfig = ref({
  outputFormat: 'csv',
  outputPath: '',
  rules: []
})

// 清洗规则相关
const rules = ref([])
const rulesLoading = ref(false)
const selectedRules = ref([])

// 默认推荐的规则码
const defaultRuleCodes = ['TRIM', 'REMOVE_NULL', 'DEDUPLICATE']

// 基础规则（普通清洗）
const basicRuleCodes = ['TRIM', 'REMOVE_NULL', 'DEDUPLICATE', 'REMOVE_DUPLICATE', 'TO_LOWER', 'TO_UPPER', 'REMOVE_EMPTY_ROW']

// 高级规则（特殊处理）
const advancedRuleCodes = ['DATA_MASK', 'PHONE_MASK', 'EMAIL_MASK', 'NORMALIZE_DATE']

const basicRules = computed(() => rules.value.filter(r => basicRuleCodes.includes(r.code)))
const advancedRules = computed(() => rules.value.filter(r => advancedRuleCodes.includes(r.code)))

const getRuleName = (code) => {
  const rule = rules.value.find(r => r.code === code)
  return rule ? (rule.name || rule.nameCn || code) : code
}

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
    const res = await getTaskList({ page: taskPage.value, size: taskPageSize.value })
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
    const res = await getTaskList({ page: taskPage.value, size: taskPageSize.value })
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
  await loadCleanRules()
}

const loadCleanRules = async () => {
  rulesLoading.value = true
  try {
    const res = await getCleanRules()
    if (res.code === 200) {
      const list = res.data || []
      rules.value = list
      // 默认勾选推荐规则
      selectedRules.value = list
        .filter(r => defaultRuleCodes.includes(r.code))
        .map(r => r.code)
    } else {
      // 如果接口不存在或失败，使用默认规则列表
      rules.value = [
        { code: 'TRIM', name: '去除空格', description: '去除字段值的首尾空格' },
        { code: 'REMOVE_NULL', name: '删除空值', description: '删除值为空或null的记录' },
        { code: 'DEDUPLICATE', name: '去除重复', description: '删除完全重复的记录' },
        { code: 'TO_LOWER', name: '转小写', description: '将文本字段转为小写' },
        { code: 'TO_UPPER', name: '转大写', description: '将文本字段转为大写' },
        { code: 'REMOVE_EMPTY_ROW', name: '删除空行', description: '删除所有字段都为空的记录' },
        { code: 'DATA_MASK', name: '数据脱敏', description: '对敏感数据进行脱敏处理', level: 'advanced' },
        { code: 'PHONE_MASK', name: '手机号脱敏', description: '对手机号进行脱敏（显示前三位和后四位）', level: 'advanced' },
        { code: 'EMAIL_MASK', name: '邮箱脱敏', description: '对邮箱地址进行脱敏', level: 'advanced' },
        { code: 'NORMALIZE_DATE', name: '日期标准化', description: '将日期统一为标准格式', level: 'advanced' }
      ]
      selectedRules.value = defaultRuleCodes
    }
  } catch (error) {
    // 降级使用本地默认规则
    rules.value = [
      { code: 'TRIM', name: '去除空格', description: '去除字段值的首尾空格' },
      { code: 'REMOVE_NULL', name: '删除空值', description: '删除值为空或null的记录' },
      { code: 'DEDUPLICATE', name: '去除重复', description: '删除完全重复的记录' },
      { code: 'TO_LOWER', name: '转小写', description: '将文本字段转为小写' },
      { code: 'TO_UPPER', name: '转大写', description: '将文本字段转为大写' },
      { code: 'REMOVE_EMPTY_ROW', name: '删除空行', description: '删除所有字段都为空的记录' },
      { code: 'DATA_MASK', name: '数据脱敏', description: '对敏感数据进行脱敏处理', level: 'advanced' },
      { code: 'PHONE_MASK', name: '手机号脱敏', description: '对手机号进行脱敏（显示前三位和后四位）', level: 'advanced' },
      { code: 'EMAIL_MASK', name: '邮箱脱敏', description: '对邮箱地址进行脱敏', level: 'advanced' },
      { code: 'NORMALIZE_DATE', name: '日期标准化', description: '将日期统一为标准格式', level: 'advanced' }
    ]
    selectedRules.value = defaultRuleCodes
  } finally {
    rulesLoading.value = false
  }
}

const confirmStart = async () => {
  taskConfig.value.rules = selectedRules.value
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

const handleViewDetail = (taskId) => {
  router.push(`/task-detail?taskId=${taskId}`)
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

/* 清洗规则区域 */
.rules-section {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
  margin-top: 8px;
}

.rules-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.rules-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.rules-tip {
  color: #909399;
  cursor: pointer;
  font-size: 14px;
}

.rules-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  padding: 12px 0;
}

.rules-group {
  margin-bottom: 14px;
}

.rules-group-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.rule-checkbox {
  margin-right: 12px;
  margin-bottom: 6px;
}

/* 规则拖拽排序 */
.rules-order {
  margin-top: 16px;
}

.rules-drag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 32px;
  padding: 6px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  background: #fafafa;
}

.drag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  cursor: grab;
  user-select: none;
}

.drag-item:active {
  cursor: grabbing;
}

.drag-item .drag-icon {
  color: #c0c4cc;
  font-size: 12px;
}

/* 拖拽动画样式 */
.ghost {
  opacity: 0.5;
  background: #409eff !important;
  color: #fff !important;
}

.chosen {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.rules-empty {
  text-align: center;
  color: #909399;
  padding: 16px 0;
  font-size: 14px;
}
</style>
