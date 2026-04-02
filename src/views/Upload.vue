<template>
  <div class="upload-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <h2>文件上传</h2>
          </template>

          <el-upload
            class="upload-area"
            drag
            :action="uploadUrl"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :on-error="handleError"
            :show-file-list="true"
            accept=".csv,.xlsx,.xls,.json"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 CSV、Excel、JSON 格式文件，文件大小不超过 100MB
              </div>
            </template>
          </el-upload>

          <el-divider />

          <div class="file-types">
            <h3>支持的文件类型：</h3>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card shadow="hover">
                  <div class="file-type-item">
                    <el-icon size="48" color="#67C23A"><Document /></el-icon>
                    <h4>CSV 文件</h4>
                    <p>逗号分隔值文件</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover">
                  <div class="file-type-item">
                    <el-icon size="48" color="#409EFF"><Document /></el-icon>
                    <h4>Excel 文件</h4>
                    <p>.xlsx / .xls 格式</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover">
                  <div class="file-type-item">
                    <el-icon size="48" color="#E6A23C"><Document /></el-icon>
                    <h4>JSON 文件</h4>
                    <p>JSON 数据格式</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const uploadUrl = '/api/file/upload'

const beforeUpload = (file) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json'
  ]

  const isAllowedType = allowedTypes.includes(file.type) ||
    file.name.endsWith('.csv') ||
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.xls') ||
    file.name.endsWith('.json')

  if (!isAllowedType) {
    ElMessage.error('只支持 CSV、Excel、JSON 格式文件')
    return false
  }

  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过 100MB')
    return false
  }

  return true
}

const handleSuccess = (response) => {
  if (response.code === 200) {
    ElMessage.success('文件上传成功')
    setTimeout(() => {
      router.push('/tasks')
    }, 1000)
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleError = (error) => {
  ElMessage.error('上传失败，请重试')
  console.error(error)
}
</script>

<style scoped>
.upload-page {
  padding: 0;
}

.upload-area {
  margin: 20px 0;
}

.upload-area :deep(.el-upload-dragger) {
  padding: 60px 20px;
}

.el-icon--upload {
  font-size: 67px;
  color: #409EFF;
  margin-bottom: 16px;
}

.file-types {
  margin-top: 30px;
}

.file-types h3 {
  margin-bottom: 20px;
  color: #333;
}

.file-type-item {
  text-align: center;
  padding: 20px;
}

.file-type-item h4 {
  margin: 15px 0 10px 0;
  color: #333;
}

.file-type-item p {
  margin: 0;
  color: #999;
  font-size: 14px;
}
</style>
