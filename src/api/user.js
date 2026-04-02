import request from './request'

export const register = (data) => {
  return request.post('/user/register', data)
}

export const login = (data) => {
  return request.post('/user/login', data)
}

export const getCaptcha = () => {
  return request.get('/user/captcha')
}

export const checkUnique = (field, value) => {
  return request.get('/user/check-unique', { params: { field, value } })
}
