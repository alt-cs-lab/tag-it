// https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs

const jwt = require('jsonwebtoken')

// Load Models
// const User = require('../models/user')

// Load Logger
const logger = require('../configs/logger')

async function authenticateToken(req, res, next) {

  logger.info("ATTEMPTING TO EXTRACT TOKEN!!!")

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  logger.warn({authHeader, token})

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
    console.log(err)

    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.sendStatus(401)
      } else {
        logger.warn('API Token Parse Error - ' + err)
        return res.sendStatus(403)
      }
    }

    req.username = user.username
    req.user_eid = user.eid

    // CURRENTLY WE DO NOT HAVE ROLES
    
    // HACK This trusts the JWT signature to give admin privs.
    // See below for a DB method for this - less efficient.
    //req.roles = user.roles

    // // check if admin
    // const roles = await User.relatedQuery('roles')
    //   .for(req.username)
    //   .select('name')
    // //Roles for current user
    // //console.log(roles)
    // if (roles.some((r) => r.name === 'admin')) {
    //   req.is_admin = true
    // } else {
    //   req.is_admin = false
    // }

    next()
  })
}

module.exports = authenticateToken