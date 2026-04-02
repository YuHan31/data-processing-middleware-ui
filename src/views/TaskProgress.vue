<template>
  <div class="task-progress-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
      <template #header>
        <div class="card-header">
          <h2>任务进度</h2>
          <el-button @click="$router.back()">
            <el-icon><Back /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <div v-if="!taskId" class="no-task">
        <el-empty description="请从任务列表选择一个任务查看进度">
          <el-button type="primary" @click="$router.push('/tasks')">前往任务列表</el-button>
        </el-empty>
      </div>

      <div v-else class="progress-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务ID">{{ progressData.taskId }}</el-descriptions-item>
          <el-descriptions-item label="当前阶段">
            <el-tag>{{ progressData.stage || '未知' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="任务状态" :span="2">
            <el-tag :type="getStatusType(progressData.status)">
              {{ getStatusText(progressData.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="progress-bar-section">
          <h3>任务进度</h3>
          <el-progress
            :percentage="progressData.progress || 0"
            :status="getProgressStatus(progressData.status)"
            :stroke-width="26"
          >
            <span class="progress-text">{{ progressData.progress || 0 }}%</span>
          </el-progress>
        </div>

        <div class="stage-info">
          <h3>阶段信息</h3>
          <el-alert
            :title="progressData.message || '正在处理中...'"
            type="info"
            :closable="false"
            show-icon
          />
        </div>

        <div class="stage-steps">
          <h3>处理阶段</h3>
          <el-steps :active="getActiveStep()" align-center>
            <el-step title="已上传" description="文件上传完成" />
            <el-step title="文件解析" description="解析上传的文件" />
            <el-step v-if="taskConfig.enableCleaning" title="数据清洗" description="清洗和验证数据" />
            <el-step v-if="taskConfig.enableNormalization" title="数据标准化" description="标准化数据格式" />
            <el-step title="结果导出" description="导出处理结果" />
            <el-step title="完成" description="任务执行完成" />
          </el-steps>
        </div>
      </div>
    </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTaskProgress } from '@/api/task'
import { getStatusType, getStatusText, getProgressStatus } from '@/utils/taskStatus'

const route = useRoute()
const taskId = ref(route.query.taskId)

// 读取任务配置
const taskConfig = ref(
  JSON.parse(sessionStorage.getItem(`taskConfig_${taskId.value}`) || '{"enableCleaning":true,"enableNormalization":true}')
)

// 根据实际启用的阶段计算当前激活步骤
const getActiveStep = () => {
  const status = progressData.value.status
  const steps = ['UPLOADED', 'PARSING']
  if (taskConfig.value.enableCleaning) steps.push('CLEANING')
  if (taskConfig.value.enableNormalization) steps.push('NORMALIZING')
  steps.push('EXPORTING', 'FINISHED')
  const idx = steps.indexOf(status)
  if (idx === -1) return 0
  // FINISHED 是最后一步时返回 steps.length，使所有步骤都显示为"已完成"状态
  return idx === steps.length - 1 ? steps.length : idx
}

const progressData = ref({
  taskId: '',
  progress: 0,
  stage: '',
  status: '',
  message: ''
})

let timer = null

const loadProgress = async () => {
  if (!taskId.value) return

  try {
    const res = await getTaskProgress(taskId.value)
    if (res.code === 200 && res.data) {
      progressData.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载进度失败')
  }
}

onMounted(() => {
  if (taskId.value) {
    loadProgress()
    timer = setInterval(loadProgress, 3000)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.task-progress-page {
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

.no-task {
  padding: 60px 0;
}

.progress-content {
  padding: 20px 0;
}

.progress-bar-section {
  margin: 40px 0;
}

.progress-bar-section h3 {
  margin-bottom: 20px;
  color: #333;
}

.progress-text {
  font-size: 18px;
  font-weight: bold;
}

.stage-info {
  margin: 40px 0;
}

.stage-info h3 {
  margin-bottom: 20px;
  color: #333;
}

.stage-steps {
  margin: 40px 0;
}

.stage-steps h3 {
  margin-bottom: 30px;
  color: #333;
}
</style>
