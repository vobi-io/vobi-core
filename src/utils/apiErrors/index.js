module.exports = Object.assign(
  require('./onErrorExpress'),
  require('./onErrorGraphql'),
  require('./responseDecorator'),
  require('./apiResponse'),
  require('./apiErrors')
)
