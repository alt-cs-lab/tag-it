/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: JWT is missing or invalid
 */

// Load Libraries
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

// Load Configurations
var cas = require('../configs/cas')
const requestLogger = require('../middleware/request-logger')
const refreshToken = require('../middleware/refresh-token')

// Load Models
//const User = require('../models/user')

// Load utils
const { getToken, getTokenFromRefreshToken, updateRefreshToken, clearRefreshToken } = require('../utils/token-store')

// Configure Logging
router.use(requestLogger)

/**
 * @swagger
 * /auth/login:
 *   get:
 *     summary: login
 *     description: log in the current user by redirecting to CAS or using force authentication if enabled
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       301:
 *         description: user is logged in, redirect to homepage
 */
router.get('/login', refreshToken, async function (req, res, next) {
  if (!req.session.username) {
    let username = ''

    if (req.query.username && process.env.FORCE_AUTH === 'true') {
      // force authentication enabled, use username from query
      email = req.query.username
    } else {
      // use CAS authentication
      if (req.session[cas.session_name] === undefined) {
        // CAS is not authenticated, so redirect
        // Hack to fix redirects
        req.url = req.originalUrl
        cas.bounce_redirect(req, res, next)
        return
      } else {
        // CAS is authenticated, get eID from session
        username = req.session[cas.session_name]
      }
    }

    if (username && username.length != 0) {
      // Find or Create User for eID
      //let user = await User.findOrCreate(eid)
      // Store User ID in session
      //req.session.user_id = user.id
      const neo4j = req.app.get('neo4j');
      // populate the user in the database
      await neo4j.executeQuery('MERGE (user:User {username: $username})', {username});
      // save username in session
      req.session.username = username
      const refreshToken = updateRefreshToken(username)
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 60 * 60 * 1000, // 5 hours
      })
    }
  }
  // Redirect to projects page
  res.redirect('/projects')
})

/**
 * @swagger
 * /auth/token:
 *   get:
 *     summary: get JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: JWT for user
 *         content:
 *           application/json:
 *             schema:
 *               token:
 *                 type: string
 *                 format: JWT
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/token', refreshToken, async function (req, res, next) {
  if (req.session.username) {
    const token = await getToken(req.session.username)
    if(token) {
      res.json({
        token: token,
      })  
      return 
    } else {
      res.status(401)
      res.json({error: 'User does not have role to request API token'})
    }  
  } else {
    res.status(401)
    res.json({ error: 'No Session Established, Please Login' })
  }
})

/**
 * @swagger
 * /auth/token:
 *   post:
 *     summary: use refresh token to get new JWT
 *     tags: [Auth]
 *     requestBody:
 *       description: refresh token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 format: JWT
 *     responses:
 *       200:
 *         description: JWT for user
 *         content:
 *           application/json:
 *             schema:
 *               token:
 *                 type: string
 *                 format: JWT
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/token', async function (req, res, next) {
  if (req.body.refresh_token) {
    jwt.verify(
      req.body.refresh_token,
      process.env.TOKEN_SECRET,
      async (err, data) => {
        if (err) {
          res.status(401)
          res.json({ error: 'Error Parsing Token' })
          return
        }
        if (data && data.refresh_token) {
          // If we receive a refresh token, generate a new token
          const token = getTokenFromRefreshToken(data.refresh_token)
          // if token is valid, send it
          if(token) {
            res.json({
              token: token,
            })
          } else {
            res.status(401)
            res.json({
              error:
                'Refresh Token Not Found in Database, Session Expired, Please Login',
            })
          }
        } else {
          res.status(401)
          res.json({ error: 'Token Data Invalid, Please Login' })
        }
      }
    )
  } else {
    res.status(401)
    res.json({ error: 'Refresh Token Not Found in Request Body' })
  }
})

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: logout
 *     description: log out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       301:
 *         description: user is logged out, redirect to home page
 */
router.get('/logout', async function (req, res, next) {
  if (req.session.username) {
    clearRefreshToken(req.session.username)
  }
  if (req.session[cas.session_name]) {
    cas.logout(req, res, next)
  } else {
    req.session.destroy()
    res.redirect('/')
  }
})

module.exports = router