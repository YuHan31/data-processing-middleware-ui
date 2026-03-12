import request from './request'

export function getTaskLog(taskId) {
  return request.get(`/log/${taskId}`)
}
