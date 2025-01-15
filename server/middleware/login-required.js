const { request } = require("express")

/* check if a user is logged in */
const loginRequired = (req, res, next) => {
  // If the session contains a username, we assume they are logged in
  // Is this subject to tampering?
  if (req.session && req.session.username && req.session.username.length != 0) {
    next()
  } else {
    res.status(403)
    res.json({ error: 'Login Required' })
  }
}

module.exports = loginRequired