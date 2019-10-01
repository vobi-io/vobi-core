'use strict'

const ApiResponse = require('./apiResponse')
const responses = require('./apiResponses')

const responseDecorator =
  (response, res) => {
    if (response instanceof ApiResponse) {
      const resp = responses[response.name]
      if (resp.status) {
        res.status(resp.status)
      }
      res.json({
        ...resp,
        ...response
      })
      return
    }
    res.json(response)
  }

module.exports = responseDecorator
