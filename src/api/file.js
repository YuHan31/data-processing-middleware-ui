import request from './request'

export function uploadFile(formData) {
  return request.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getFileInfo(taskId) {
  return request.get(`/file/info/${taskId}`)
}

export function downloadFile(taskId) {
  return request.get(`/file/download/${taskId}`, {
    responseType: 'blob'
  })
}
