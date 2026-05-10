<template>
  <div class="task-detail-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <h2>任务详情</h2>
              <div class="header-actions">
                <el-button @click="$router.back()">
                  <el-icon><Back /></el-icon>
                  返回
                </el-button>
                <el-button type="primary" @click="handleRefresh">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <!-- 无任务ID -->
          <div v-if="!taskId" class="no-task">
            <el-empty description="请从任务列表选择一个任务查看详情">
              <el-button type="primary" @click="$router.push('/tasks')">前往任务列表</el-button>
            </el-empty>
          </div>

          <div v-else class="detail-content">
            <!-- Tab 切换 -->
            <el-tabs v-model="activeTab" class="main-tabs">
              <el-tab-pane label="任务详情" name="detail">
                <!-- 任务基本信息 -->
            <el-descriptions :column="2" border class="task-info">
              <el-descriptions-item label="任务ID">{{ taskInfo.taskId || taskId }}</el-descriptions-item>
              <el-descriptions-item label="任务名称">{{ taskInfo.taskName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="当前状态">
                <el-tag :type="getStatusType(taskInfo.status || detailData.status)">
                  {{ getStatusText(taskInfo.status || detailData.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="进度">
                <el-progress
                  :percentage="detailData.progress || 0"
                  :status="getProgressStatus(taskInfo.status || detailData.status)"
                  :stroke-width="14"
                  style="width: 200px"
                />
              </el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ formatTime(taskInfo.startTime || detailData.startTime) }}</el-descriptions-item>
              <el-descriptions-item label="结束时间">{{ formatTime(taskInfo.endTime || detailData.endTime) }}</el-descriptions-item>
            </el-descriptions>

            <!-- 流程可视化 -->
            <div class="flow-section">
              <h3 class="section-title">
                <el-icon><Guide /></el-icon>
                任务流程
              </h3>
              <el-steps :active="activeStepIndex" align-center class="flow-steps">
                <el-step
                  v-for="stage in flowStages"
                  :key="stage.key"
                  :title="stage.name"
                  :description="stage.description"
                  :status="stage.status"
                >
                  <template #icon>
                    <div :class="['step-icon', stage.status]">
                      <el-icon v-if="stage.status === 'finish'"><CircleCheck /></el-icon>
                      <el-icon v-else-if="stage.status === 'error'"><CircleClose /></el-icon>
                      <el-icon v-else-if="stage.status === 'process'" class="is-loading"><Loading /></el-icon>
                      <el-icon v-else><More /></el-icon>
                    </div>
                  </template>
                </el-step>
              </el-steps>
            </div>

            <!-- 当前阶段信息 -->
            <div class="current-stage-section" v-if="detailData.stage">
              <h3 class="section-title">
                <el-icon><InfoFilled /></el-icon>
                当前阶段
              </h3>
              <el-alert
                :title="getStageAlertTitle()"
                :type="getStageAlertType()"
                :closable="false"
                show-icon
              />
              <div class="stage-detail" v-if="detailData.message">
                <p class="message-text">{{ detailData.message }}</p>
              </div>
            </div>

            <!-- 失败原因 -->
            <div class="failure-section" v-if="(taskInfo.status || detailData.status) === 'FAILED' && failureReason">
              <h3 class="section-title">
                <el-icon><WarningFilled /></el-icon>
                失败原因
              </h3>
              <el-alert
                :title="failureReason"
                type="error"
                :closable="false"
                show-icon
              />
            </div>

            <!-- 清洗规则（仅在任务配置中显示） -->
            <div class="rules-section" v-if="appliedRules && appliedRules.length > 0">
              <h3 class="section-title">
                <el-icon><Tools /></el-icon>
                已应用清洗规则
              </h3>
              <el-tag
                v-for="rule in appliedRules"
                :key="rule"
                type="info"
                class="rule-tag"
              >
                {{ getRuleDisplayName(rule) }}
              </el-tag>
            </div>
              </el-tab-pane>

              <el-tab-pane label="数据对比" name="compare" :lazy="false">
                <DataCompare ref="dataCompareRef" :task-id="taskId" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTaskProgress, getTaskList, getTaskRules } from '@/api/task'
import { getTaskFailureReason } from '@/api/log'
import { getStatusType, getStatusText, getProgressStatus } from '@/utils/taskStatus'
import DataCompare from './DataCompare.vue'

const route = useRoute()
const taskId = ref(route.query.taskId)

// 任务详情数据
const detailData = ref({
  taskId: '',
  status: '',
  progress: 0,
  stage: '',
  message: '',
  startTime: '',
  endTime: ''
})

// 任务基础信息（从任务列表获取）
const taskInfo = ref({
  taskId: '',
  taskName: '',
  status: '',
  startTime: '',
  endTime: ''
})

// 失败原因
const failureReason = ref('')

// 定时器
let timer = null
let reasonTimer = null

// DataCompare 组件 ref
const dataCompareRef = ref(null)
const activeTab = ref('detail')

// 流程定义（上传 → 解析 → 清洗 → 导出 → 完成）
const flowDefinition = [
  { key: 'UPLOADED', name: '文件上传', description: '文件上传完成' },
  { key: 'PARSING', name: '数据解析', description: '解析上传的文件' },
  { key: 'CLEANING', name: '数据清洗', description: '清洗和验证数据' },
  { key: 'EXPORTING', name: '数据导出', description: '导出处理结果' },
  { key: 'FINISHED', name: '任务完成', description: '任务执行完成' }
]

// 读取任务配置中的规则
const taskConfig = ref(null)
const appliedRules = computed(() => taskConfig.value?.rules || [])

const updateTaskRules = (rules = []) => {
  taskConfig.value = {
    ...(taskConfig.value || {}),
    rules
  }
}

const loadTaskRules = async () => {
  if (!taskId.value) return
  try {
    const res = await getTaskRules(taskId.value)
    if (res.code === 200) {
      updateTaskRules(res.data || [])
    }
  } catch (error) {
    console.error('加载任务规则失败:', error)
  }
}

// 根据后端返回的 stage 找到对应的流程步骤
const activeStepIndex = computed(() => {
  const stage = detailData.value.stage
  // 后端返回中文 stage 名，尝试匹配
  const chineseMap = {
    '文件上传': 0,
    '数据解析': 1,
    '数据清洗': 2,
    '数据导出': 3,
    '任务完成': 4
  }
  if (chineseMap[stage] !== undefined) return chineseMap[stage]

  // 兼容英文状态码
  const idx = flowDefinition.findIndex(f => f.key === stage)
  return idx >= 0 ? idx : 0
})

// 根据后端返回的 status 计算每个步骤的 el-step status
const flowStages = computed(() => {
  // 优先使用任务列表中的状态，其次用进度数据中的状态
  const status = taskInfo.value.status || detailData.value.status

  // 如果任务失败，所有已完成步骤标记为 finish
  if (status === 'FAILED') {
    return flowDefinition.map((f, idx) => {
      const stage = detailData.value.stage
      // 找到失败所在的步骤
      const failIdx = flowDefinition.findIndex(f => f.key === stage)
      if (idx < failIdx) return { ...f, status: 'finish' }
      if (idx === failIdx) return { ...f, status: 'error' }
      return { ...f, status: 'wait' }
    })
  }

  // 正常流程
  const currentIdx = activeStepIndex.value
  return flowDefinition.map((f, idx) => {
    if (idx < currentIdx) return { ...f, status: 'finish' }
    if (idx === currentIdx) {
      if (status === 'FINISHED') return { ...f, status: 'finish' }
      if (status === 'FAILED') return { ...f, status: 'error' }
      return { ...f, status: 'process' }
    }
    return { ...f, status: 'wait' }
  })
})

// 加载任务基础信息（名称、时间等从任务列表获取）
const loadTaskInfo = async () => {
  if (!taskId.value) return
  try {
    const res = await getTaskList()
    if (res.code === 200) {
      const list = res.data.tasks || res.data || []
      const task = list.find(t => t.taskId === taskId.value)
      if (task) {
        taskInfo.value = task
      }
    }
  } catch (error) {
    console.error('加载任务信息失败:', error)
  }
}

// 加载任务详情
const loadDetail = async () => {
  if (!taskId.value) return

  // 读取本地配置
  const savedConfig = sessionStorage.getItem(`taskConfig_${taskId.value}`)
  if (savedConfig) {
    taskConfig.value = JSON.parse(savedConfig)
  }

  try {
    const res = await getTaskProgress(taskId.value)
    if (res.code === 200 && res.data) {
      detailData.value = res.data
      if (Array.isArray(res.data.rules)) {
        updateTaskRules(res.data.rules)
      }
    }
  } catch (error) {
    console.error('加载任务详情失败:', error)
  }
}

// 加载失败原因
const loadFailureReason = async () => {
  if (!taskId.value) return
  try {
    const res = await getTaskFailureReason(taskId.value)
    if (res.code === 200 && res.data) {
      failureReason.value = res.data.reason || '未知错误'
    }
  } catch (error) {
    console.error('加载失败原因失败:', error)
  }
}

// 获取阶段告警标题
const getStageAlertTitle = () => {
  const map = {
    '文件上传': '文件已上传，等待处理',
    '数据解析': '正在解析文件数据...',
    '数据清洗': '正在执行数据清洗规则...',
    '数据导出': '正在导出处理结果...',
    '任务完成': '任务已成功完成',
    '任务失败': '任务执行失败'
  }
  return map[detailData.value.stage] || detailData.value.message || '正在处理中...'
}

// 获取告警类型
const getStageAlertType = () => {
  if (detailData.value.status === 'FINISHED') return 'success'
  if (detailData.value.status === 'FAILED') return 'error'
  return 'info'
}

// 规则码转中文名
const ruleNameMap = {
  'TRIM': '去除空格',
  'REMOVE_NULL': '删除空值',
  'DEDUPLICATE': '去除重复',
  'TO_LOWER': '转小写',
  'TO_UPPER': '转大写',
  'REMOVE_EMPTY_ROW': '删除空行',
  'DATA_MASK': '数据脱敏',
  'PHONE_MASK': '手机号脱敏',
  'EMAIL_MASK': '邮箱脱敏',
  'NORMALIZE_DATE': '日期标准化'
}

const getRuleDisplayName = (code) => {
  return ruleNameMap[code] || code
}

// 刷新
const handleRefresh = () => {
  loadTaskInfo()
  loadDetail()
  if (activeTab.value === 'compare' && dataCompareRef.value) {
    dataCompareRef.value.refresh()
  }
}

// 格式化时间
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

onMounted(() => {
  if (taskId.value) {
    loadTaskInfo()
    loadTaskRules()
    loadDetail()
    // 每 2 秒轮询更新
    timer = setInterval(() => {
      loadTaskInfo()
      loadDetail()
    }, 2000)
    // 任务失败后加载失败原因
    reasonTimer = setInterval(() => {
      const currentStatus = taskInfo.value.status || detailData.value.status
      if (currentStatus === 'FAILED' && !failureReason.value) {
        loadFailureReason()
      }
    }, 2000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (reasonTimer) clearInterval(reasonTimer)
})
</script>

<style scoped>
.task-detail-page {
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

.header-actions {
  display: flex;
  gap: 8px;
}

.no-task {
  padding: 60px 0;
}

.detail-content {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.task-info {
  margin-bottom: 8px;
}

/* 流程可视化区域 */
.flow-section {
  background: #fafbfc;
  border-radius: 8px;
  padding: 24px 16px;
  border: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 20px 0;
  font-size: 15px;
  color: #303133;
  font-weight: 600;
}

.flow-steps {
  padding: 0 20px;
}

/* 步骤图标样式 */
.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 14px;
}

.step-icon.finish {
  color: #67c23a;
  background: #f0f9eb;
}

.step-icon.error {
  color: #f56c6c;
  background: #fef0f0;
}

.step-icon.process {
  color: #409eff;
  background: #ecf5ff;
}

.step-icon.wait {
  color: #c0c4cc;
  background: #f5f7fa;
}

/* 当前阶段区域 */
.current-stage-section {
  /* */
}

.stage-detail {
  margin-top: 12px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.message-text {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

/* 失败区域 */
.failure-section {
  /* */
}

/* 规则区域 */
.rules-section {
  /* */
}

.rule-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

/* Tab 样式 */
.main-tabs {
  margin-top: 4px;
}
</style>
