<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="header-card">
          <h1>数据处理中间件系统</h1>
          <p>欢迎使用数据处理中间件系统，支持CSV、Excel、JSON等多种文件的自动化处理</p>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409EFF"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总任务数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67C23A"><Loading /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.running }}</div>
              <div class="stat-label">运行任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67C23A"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">完成任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#F56C6C"><CircleClose /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.failed }}</div>
              <div class="stat-label">失败任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近任务</span>
              <el-button type="primary" size="small" @click="$router.push('/tasks')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentTasks" style="width: 100%">
            <el-table-column prop="taskId" label="任务ID" width="180" />
            <el-table-column prop="taskName" label="任务名称" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="处理记录" width="150">
              <template #default="{ row }">
                {{ row.processedRecords !== null ? row.processedRecords + ' 条' : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="180">
              <template #default="{ row }">
                {{ row.startTime || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTaskList } from '@/api/task'
import { getStatusType, getStatusText, getProgressStatus, isRunningStatus } from '@/utils/taskStatus'

const stats = ref({
  total: 0,
  running: 0,
  completed: 0,
  failed: 0
})

const recentTasks = ref([])

const loadData = async () => {
  try {
    const res = await getTaskList()
    if (res.code === 200 && res.data) {
      // 适配分页数据结构
      const tasks = res.data.tasks || res.data || []
      stats.value.total = tasks.length
      stats.value.running = tasks.filter(t => isRunningStatus(t.status)).length
      stats.value.completed = tasks.filter(t => t.status === 'FINISHED').length
      stats.value.failed = tasks.filter(t => t.status === 'FAILED').length
      recentTasks.value = tasks.slice(0, 5)
    }
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.header-card {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-card h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
}

.header-card p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
