'use strict'

const responses = require('./apiResponses')
const ApiError = require('./apiError')

const onErrorExpress = (err, res) => {
  if (err instanceof ApiError) {
    if (err.extra.status) {
      res.status(err.extra.status)
    }
    res.json({
      ...err.extra,
      message: err.message
    })
    return
  }

  res.status(500)
  res.json({
    ...responses.serverError,
    message: err.message
  })
}

module.exports = onErrorExpress
