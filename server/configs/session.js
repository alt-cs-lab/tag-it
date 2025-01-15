const session = require('express-session')
const connectNeo4j = require('connect-neo4j')
const db = require('../configs/neo4j')

// session setup
//let Neo4jStore = connectNeo4j(session)
// session setup
module.exports = session({
  // Neo4j store
//  store: new Neo4jStore({client: db}),
  // We want a unique session secret for the application, 
  // ideally stored as an environment variable.
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  // resave forces the session to be written back to the 
  // session store when no changes have been made
  resave: true,
  // saveUninitialized allows new and unmodified sessions
  // to be saved to the session store.  Since we're using 
  // the username to determine login status, `true` is fine.
  saveUninitialized: true,
  // Cookie-specific settings
  cookie: { 
    // secure requires the client to be using https
    secure: process.env.SECURE_SESSION === 'true',
  }
});