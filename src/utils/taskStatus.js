/**
 * 任务状态工具函数
 */

// 任务状态枚举
export const TaskStatus = {
  UPLOADED: 'UPLOADED',       // 已上传
  PARSING: 'PARSING',         // 解析中
  CLEANING: 'CLEANING',       // 清洗中
  NORMALIZING: 'NORMALIZING', // 标准化中
  EXPORTING: 'EXPORTING',     // 导出中
  FINISHED: 'FINISHED',       // 已完成
  FAILED: 'FAILED'            // 失败
}

// 获取状态文本
export function getStatusText(status) {
  const map = {
    'UPLOADED': '已上传',
    'PARSING': '解析中',
    'CLEANING': '清洗中',
    'NORMALIZING': '标准化中',
    'EXPORTING': '导出中',
    'FINISHED': '已完成',
    'FAILED': '失败'
  }
  return map[status] || status
}

// 获取状态类型（用于 el-tag）
export function getStatusType(status) {
  const map = {
    'UPLOADED': 'info',
    'PARSING': 'warning',
    'CLEANING': 'warning',
    'NORMALIZING': 'warning',
    'EXPORTING': 'warning',
    'FINISHED': 'success',
    'FAILED': 'danger'
  }
  return map[status] || 'info'
}

// 获取进度条状态
export function getProgressStatus(status) {
  if (status === 'FINISHED') return 'success'
  if (status === 'FAILED') return 'exception'
  return null
}

// 判断是否为运行中状态
export function isRunningStatus(status) {
  return ['PARSING', 'CLEANING', 'NORMALIZING', 'EXPORTING'].includes(status)
}

// 判断是否可以启动
export function canStart(status) {
  return status === 'UPLOADED' || status === 'FAILED'
}

// 判断是否可以停止
export function canStop(status) {
  return isRunningStatus(status)
}

// 判断是否可以下载
export function canDownload(status) {
  return status === 'FINISHED'
}

// 获取阶段对应的步骤索引
export function getStageStep(status) {
  const stageMap = {
    'UPLOADED': 0,
    'PARSING': 1,
    'CLEANING': 2,
    'NORMALIZING': 3,
    'EXPORTING': 4,
    'FINISHED': 5
  }
  return stageMap[status] || 0
}
