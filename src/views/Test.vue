<template>
  <div class="test-page">
    <el-card>
      <template #header>
        <h2>API 连接测试</h2>
      </template>

      <el-space direction="vertical" style="width: 100%">
        <el-alert
          title="测试说明"
          type="info"
          :closable="false"
        >
          点击下方按钮测试后端 API 连接状态
        </el-alert>

        <el-divider />

        <div>
          <h3>1. 测试后端连接</h3>
          <el-button type="primary" @click="testConnection" :loading="testing">
            测试连接
          </el-button>
          <el-tag v-if="connectionStatus" :type="connectionStatus.type" style="margin-left: 10px">
            {{ connectionStatus.message }}
          </el-tag>
        </div>

        <el-divider />

        <div>
          <h3>2. 测试任务列表接口</h3>
          <el-button type="primary" @click="testTaskList" :loading="testingTask">
            测试 /api/task/list
          </el-button>
        </div>

        <div v-if="taskListResult" style="margin-top: 10px">
          <el-alert
            :title="taskListResult.success ? '成功' : '失败'"
            :type="taskListResult.success ? 'success' : 'error'"
            :closable="false"
          >
            <pre>{{ taskListResult.data }}</pre>
          </el-alert>
        </div>

        <el-divider />

        <div>
          <h3>配置信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="前端地址">http://localhost:3000</el-descriptions-item>
            <el-descriptions-item label="后端代理">http://localhost:9999</el-descriptions-item>
            <el-descriptions-item label="API 路径">/api/task/list</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getTaskList } from '@/api/task'
import axios from 'axios'

const testing = ref(false)
const testingTask = ref(false)
const connectionStatus = ref(null)
const taskListResult = ref(null)

const testConnection = async () => {
  testing.value = true
  connectionStatus.value = null

  try {
    // 直接测试后端地址
    const response = await axios.get('http://localhost:9999/api/task/list', {
      timeout: 5000
    })

    connectionStatus.value = {
      type: 'success',
      message: '后端连接成功！'
    }
    ElMessage.success('后端服务正常运行')
  } catch (error) {
    console.error('连接测试失败:', error)

    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      connectionStatus.value = {
        type: 'error',
        message: '无法连接到后端服务，请确认后端是否启动在 9999 端口'
      }
    } else if (error.response) {
      connectionStatus.value = {
        type: 'warning',
        message: `后端返回错误: ${error.response.status} ${error.response.statusText}`
      }
    } else {
      connectionStatus.value = {
        type: 'error',
        message: `连接失败: ${error.message}`
      }
    }
  } finally {
    testing.value = false
  }
}

const testTaskList = async () => {
  testingTask.value = true
  taskListResult.value = null

  try {
    const res = await getTaskList()

    taskListResult.value = {
      success: true,
      data: JSON.stringify(res, null, 2)
    }

    ElMessage.success('接口调用成功')
  } catch (error) {
    console.error('接口测试失败:', error)

    taskListResult.value = {
      success: false,
      data: `错误信息: ${error.message}\n\n${error.response ? JSON.stringify(error.response.data, null, 2) : '无响应数据'}`
    }

    ElMessage.error('接口调用失败')
  } finally {
    testingTask.value = false
  }
}
</script>

<style scoped>
.test-page {
  padding: 0;
}

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}
</style>
