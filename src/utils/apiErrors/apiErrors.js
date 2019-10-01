'use strict'

const responses = require('./apiResponses')
const ApiError = require('./apiError')

const errorToResponse =
  errName =>
    message => {
      const response = responses[errName]
      const apiError = new ApiError(message, response)
      return Promise.reject(apiError)
    }

const apiErrors = {}
Object
  .keys(responses)
  .forEach(errName => {
    apiErrors[errName] = errorToResponse(errName)
  })

module.exports = apiErrors
