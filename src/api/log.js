import request from './request'

export function getTaskFailureReason(taskId) {
  return request.get(`/log/${taskId}/reason`)
}