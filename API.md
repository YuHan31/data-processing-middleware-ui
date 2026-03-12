# API 接口文档

## 基础信息

- 基础路径: `/api`
- 默认后端地址: `http://localhost:9999`

## 接口列表

### 1. 任务管理

#### 1.1 获取任务列表

**接口地址**: `GET /api/task/list`

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "taskId": "123",
      "fileName": "data.csv",
      "status": "RUNNING",
      "progress": 60,
      "createTime": "2024-03-13 10:00:00"
    }
  ]
}
```

**状态说明**:
- `UPLOADED`: 已上传
- `PARSING`: 解析中
- `CLEANING`: 清洗中
- `NORMALIZING`: 标准化中
- `EXPORTING`: 导出中
- `FINISHED`: 已完成
- `FAILED`: 失败

#### 1.2 创建任务

**接口地址**: `POST /api/task/create`

**请求参数**:
```json
{
  "fileName": "data.csv",
  "fileType": "CSV"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "taskId": "123"
  },
  "message": "任务创建成功"
}
```

#### 1.3 启动任务

**接口地址**: `POST /api/task/start/{taskId}`

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "message": "任务启动成功"
}
```

#### 1.4 停止任务

**接口地址**: `POST /api/task/stop/{taskId}`

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "message": "任务已停止"
}
```

#### 1.5 查询任务状态

**接口地址**: `GET /api/task/status/{taskId}`

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "taskId": "123",
    "status": "RUNNING"
  }
}
```

#### 1.6 查询任务进度

**接口地址**: `GET /api/task/progress/{taskId}`

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "taskId": "123",
    "progress": 70,
    "stage": "CLEANING",
    "status": "RUNNING",
    "message": "数据清洗中"
  }
}
```

**阶段说明**:
- `UPLOADED`: 已上传
- `PARSING`: 文件解析
- `CLEANING`: 数据清洗
- `NORMALIZING`: 数据标准化
- `EXPORTING`: 结果导出
- `FINISHED`: 完成

### 2. 文件管理

#### 2.1 上传文件

**接口地址**: `POST /api/file/upload`

**请求类型**: `multipart/form-data`

**请求参数**:
- `file`: 文件对象

**支持格式**:
- CSV (.csv)
- Excel (.xlsx, .xls)
- JSON (.json)

**文件大小限制**: 100MB

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "taskId": "123"
  },
  "message": "上传成功"
}
```

#### 2.2 查询文件信息

**接口地址**: `GET /api/file/info/{taskId}`

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "taskId": "123",
    "fileName": "data.csv",
    "fileSize": 1024000,
    "fileType": "CSV",
    "uploadTime": "2024-03-13 10:00:00"
  }
}
```

#### 2.3 下载结果文件

**接口地址**: `GET /api/file/download/{taskId}`

**路径参数**:
- `taskId`: 任务ID

**响应类型**: `application/octet-stream`

**说明**: 返回二进制文件流，浏览器自动下载

### 3. 日志管理

#### 3.1 获取任务日志

**接口地址**: `GET /api/log/{taskId}`

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "data": [
    "[INFO] 任务创建成功",
    "[INFO] 开始解析CSV文件",
    "[INFO] 数据清洗完成",
    "[SUCCESS] 数据导出完成"
  ]
}
```

**日志级别**:
- `[INFO]`: 信息日志（蓝色）
- `[WARN]`: 警告日志（橙色）
- `[ERROR]`: 错误日志（红色）
- `[SUCCESS]`: 成功日志（绿色）

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 前端调用示例

### 使用封装的 API

```javascript
import { getTaskList, createTask, startTask, getTaskStatus } from '@/api/task'
import { uploadFile, getFileInfo } from '@/api/file'

// 获取任务列表
const tasks = await getTaskList()

// 创建任务
await createTask({ fileName: 'data.csv', fileType: 'CSV' })

// 启动任务
await startTask('123')

// 查询任务状态
await getTaskStatus('123')

// 查询文件信息
await getFileInfo('123')
```

### 直接使用 Axios

```javascript
import request from '@/api/request'

// GET 请求
const response = await request.get('/task/list')

// POST 请求
await request.post('/task/start/123')

// 文件上传
const formData = new FormData()
formData.append('file', file)
await request.post('/file/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```
