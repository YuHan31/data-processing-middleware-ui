import { ResultCode } from './ResultCode'

/**
 * 统一响应结果封装类
 */
export class Result {
  constructor(code, message, data = null) {
    this.code = code
    this.message = message
    this.data = data
    this.timestamp = Date.now()
  }

  static success(dataOrMessage, data) {
    if (arguments.length === 0) {
      return new Result(ResultCode.SUCCESS.code, ResultCode.SUCCESS.message)
    }
    if (arguments.length === 1) {
      if (typeof dataOrMessage === 'string') {
        return new Result(ResultCode.SUCCESS.code, dataOrMessage)
      }
      return new Result(ResultCode.SUCCESS.code, ResultCode.SUCCESS.message, dataOrMessage)
    }
    return new Result(ResultCode.SUCCESS.code, dataOrMessage, data)
  }

  static fail(codeOrMessage, message) {
    if (arguments.length === 0) {
      return new Result(ResultCode.INTERNAL_SERVER_ERROR.code, ResultCode.INTERNAL_SERVER_ERROR.message)
    }
    if (arguments.length === 1) {
      if (typeof codeOrMessage === 'string') {
        return new Result(ResultCode.INTERNAL_SERVER_ERROR.code, codeOrMessage)
      }
      return new Result(codeOrMessage.code, codeOrMessage.message)
    }
    if (typeof codeOrMessage === 'number') {
      return new Result(codeOrMessage, message)
    }
    return new Result(codeOrMessage.code, message)
  }

  isSuccess() {
    return this.code === ResultCode.SUCCESS.code
  }
}