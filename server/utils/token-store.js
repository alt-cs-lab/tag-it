// Libraries
const fs = require('fs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const neo4j = require('../configs/neo4j')
const logger = require('../configs/logger')

/**
 * Creates a token for a specific username
 * @param {string} username 
 * @returns {string} token
 */
function getToken(username) {
  //const refreshToken = updateRefreshToken(username)
  const token = jwt.sign(
    {
      username: username
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: '30m'
    }
  )
  return token
}

async function updateRefreshToken(username) {
  var {records} = await neo4j.executeQuery(`
    MATCH (user:User {username: $username})
    RETURN user;
  `, { username });
  if(records.length == 0) return null;
  let { token } = records[0].get('user').properties;
  if(!token) {
    token = crypto.randomBytes(32).toString('hex')
    await neo4j.executeQuery(`
      MATCH (user:User {username: $username})
      SET user.token = $token
    `, {username, token});
  }
  const refreshToken = jwt.sign(
    {
      username: username,
      refresh_token: token
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: '6h'
    }
  )
  return refreshToken
}

async function clearToken(username) {
  await neo4j.executeQuery('MATCH (user:User {username: $username})', {token: null});
}

async function getUsernameFromRefreshToken(token) {  
  var {records} = await neo4j.executeQuery(`
    MATCH (user:User {token: $token})
    RETURN user;
  `, { token });
  if(records.length == 0) return null;
  const { username } = records[0].get('user').properties;
  return username
}

module.exports = {getToken, getUsernameFromRefreshToken, updateRefreshToken}