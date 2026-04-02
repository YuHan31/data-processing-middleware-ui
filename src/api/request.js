import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Result } from './Result'
import { ResultCode } from './ResultCode'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.request.use(
  config => {
    const noAuthUrls = ['/user/login', '/user/register', '/user/captcha', '/user/check-unique']
    const needAuth = !noAuthUrls.some(url => config.url.includes(url))

    if (needAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => {
    if (response.config.responseType === 'blob') {
      return response
    }
    const data = response.data
    if (data.code && data.code !== 200 && data.code !== 0) {
      return data
    }
    return data
  },
  error => {
    let message = '请求失败'
    let code = ResultCode.INTERNAL_SERVER_ERROR.code

    if (error.response) {
      const { status, data } = error.response
      code = status
      message = data?.message || data?.error || ResultCode.INTERNAL_SERVER_ERROR.message

      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        window.location.href = '/login'
      }
    } else if (error.message) {
      message = error.message
    }

    ElMessage.error(message)
    return Result.fail(code, message)
  }
)

export default request
