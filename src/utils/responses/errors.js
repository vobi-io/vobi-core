'use strict'
var debug = require('debug')('invoicewave')

class MyError {
  notFound (err) {
    var error
    if (typeof err === 'string') {
      error = new Error(err)
    } else {
      error = new Error(err.message)
    }

    error.status = 404
    error.code = 'E_NOT_FOUND'
    debug(error)
    return error
  }

  badRequest (err) {
    var error
    if (typeof err === 'string') {
      error = new Error(err)
    } else {
      error = new Error(err.message)
    }

    error.status = 400
    error.code = 'E_BAD_REQUEST'
    debug(error)
    return error
  }

  forbidden (err) {
    var error
    if (typeof err === 'string') {
      error = new Error(err)
    } else {
      error = new Error(err.message)
    }

    error.status = 403
    error.code = 'E_FORBIDDEN'
    debug(error)
    return error
  }

  unauthorized (err) {
    var error
    if (typeof err === 'string') {
      error = new Error(err)
    } else {
      error = new Error(err.message)
    }

    error.status = 401
    error.code = 'E_UNAUTHORIZED'
    debug(error)
    return error
  }
}

module.exports = new MyError()
