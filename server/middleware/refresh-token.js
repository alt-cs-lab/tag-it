const jwt = require('jsonwebtoken')
const logger = require('../configs/logger.js')
const tokenStore = require('../utils/token-store.js')

async function refreshToken(req, res, next) {
  const refresh_token = req.cookies['refresh_token']
  if (refresh_token == null) {
    logger.debug('refresh-token: Token is null')
    return next()
  }
  jwt.verify(refresh_token, process.env.TOKEN_SECRET, async (err, token) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        logger.debug('refresh-token: Token expired')
        return next()
      } else {
        logger.debug('refresh-token: Token verification error')
        logger.debug(err)
        return next()
      }
    }    
    const username = await tokenStore.getUsernameFromRefreshToken(token.refresh_token)
    if(username == null) {
      logger.debug('refresh-token: Token is not in store')
      return next()
    }
    // Consider killing sessions there
    logger.debug('refresh-token: Token refreshed for user ' + username)
    req.session.username = username
    return next()
  })
}

module.exports = refreshToken