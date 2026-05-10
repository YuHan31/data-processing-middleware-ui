import request from './request'

export const register = (data) => {
  return request.post('/user/register', data)
}

export const login = (data) => {
  return request.post('/user/login', data).then(res => {
    if (res.code === 200 && res.data) {
      localStorage.setItem('userId', res.data.userId)
      localStorage.setItem('role', res.data.role || 'USER')
    }
    return res
  })
}

export const getCaptcha = () => {
  return request.get('/user/captcha')
}

export const checkUnique = (field, value) => {
  return request.get('/user/check-unique', { params: { field, value } })
}

export const getUserStats = () => {
  return request.get('/user/stats')
}
