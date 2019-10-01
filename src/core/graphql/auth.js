
const isAuthenticated = next => (rp) => {
  if (!rp.context.user) {
    throw new Error('User not authorized')
  }
  return next(rp)
}

module.exports = {
  isAuthenticated
}
