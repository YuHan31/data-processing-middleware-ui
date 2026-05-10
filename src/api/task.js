import request from './request'

export function getTaskList(params) {
  return request.get('/task/list', { params })
}

export function createTask(data) {
  return request.post('/task/create', data)
}

export function startTask(taskId, config) {
  return request.post(`/task/start/${taskId}`, config)
}

export function stopTask(taskId) {
  return request.post(`/task/stop/${taskId}`)
}

export function getTaskStatus(taskId) {
  return request.get(`/task/status/${taskId}`)
}

export function getTaskProgress(taskId) {
  return request.get(`/task/progress/${taskId}`)
}

export function getTaskRules(taskId) {
  return request.get(`/task/rules/${taskId}`)
}

export function deleteTask(taskId) {
  return request.delete(`/task/${taskId}`)
}

export function getCleanRules() {
  return request.get('/clean-rule/all')
}

export function getTaskCompare(taskId, params) {
  return request.get(`/task/compare/${taskId}`, { params })
}

export function getTaskCompareStats(taskId) {
  return request.get(`/task/compare/${taskId}/stats`)
}

export function getTaskCompareByField(taskId, field, params) {
  return request.get(`/task/compare/${taskId}/field/${field}`, { params })
}
