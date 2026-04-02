import request from './request'

export function getTaskList() {
  return request.get('/task/list')
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

export function deleteTask(taskId) {
  return request.delete(`/task/${taskId}`)
}
