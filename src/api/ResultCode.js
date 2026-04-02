/**
 * 响应状态码枚举
 */
export const ResultCode = {
  SUCCESS:                { code: 200,  message: '操作成功' },
  FAIL:                   { code: 500,  message: '操作失败' },
  PARAM_ERROR:            { code: 400,  message: '参数错误' },
  UNAUTHORIZED:           { code: 401,  message: '未授权，请先登录' },
  FORBIDDEN:              { code: 403,  message: '无权限访问' },
  NOT_FOUND:              { code: 404,  message: '资源未找到' },
  METHOD_NOT_ALLOWED:     { code: 405,  message: '请求方法不支持' },
  INTERNAL_SERVER_ERROR:  { code: 500,  message: '服务器内部错误' },
  SERVICE_UNAVAILABLE:    { code: 503,  message: '服务不可用' },
  BUSINESS_ERROR:         { code: 600,  message: '业务异常' },
}