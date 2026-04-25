import request from './request'

export const getUsers = (params) => {
  return request.get('/admin/users', { params })
}

export const toggleUser = (userId) => {
  return request.post(`/admin/users/${userId}/toggle`)
}

export const getAllTasks = (params) => {
  return request.get('/admin/tasks', { params })
}

export const getUserTasks = (userId, params) => {
  return request.get(`/admin/users/${userId}/tasks`, { params })
}

export const getTaskRules = (taskId) => {
  return request.get(`/admin/tasks/${taskId}/rules`)
}

export const getTaskLogs = (taskId) => {
  return request.get(`/admin/logs/task/${taskId}`)
}

export const getUserLogs = (userId, params) => {
  return request.get(`/admin/logs/user/${userId}`, { params })
}

export const getAllLogs = (params) => {
  return request.get('/admin/logs', { params })
}

export const getCleanRules = () => {
  return request.get('/admin/clean-rules')
}

export const addCleanRule = (data) => {
  return request.post('/admin/clean-rules', data)
}

export const updateCleanRule = (id, data) => {
  return request.put(`/admin/clean-rules/${id}`, data)
}

export const deleteCleanRule = (id) => {
  return request.delete(`/admin/clean-rules/${id}`)
}

export const toggleCleanRule = (id) => {
  return request.post(`/admin/clean-rules/${id}/toggle`)
}
