'use strict'

class ApiError extends Error {
  constructor (message, code, extra) {
    super(message)
    this.name = this.constructor.name
    this.extra = extra
    if (this.extra && code) {
      this.extra.code = code
    }
    Error.captureStackTrace(this, ApiError)
  }
}

module.exports = ApiError
