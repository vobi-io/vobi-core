'use strict'

const responses = require('./apiResponses')
const ApiError = require('./apiError')

const errorToResponse =
  errName =>
    (message, code) => {
      const response = responses[errName]
      const apiError = new ApiError(message, code, response)
      return Promise.reject(apiError)
    }

const apiErrors = {}
Object
  .keys(responses)
  .forEach(errName => {
    apiErrors[errName] = errorToResponse(errName)
  })

module.exports = apiErrors
