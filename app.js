const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const neo4j = require('neo4j-driver');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');
const documentsRouter = require('./routes/documents');
const codesRouter = require('./routes/codes');


const app = express();

if (app.get('env') === 'production') {
  // trust first proxy (Traefik)
  app.set('trust proxy', 1);
}

// database setup
const db_host = process.env.NEO4J_HOST || 'neo'
const db_port = process.env.NEO4J_PORT || '7687'
const auth = (process.env.NEO4J_AUTH || "neo4j/neo4j").split('/');
const driver = neo4j.driver('bolt://'+db_host+':'+db_port, neo4j.auth.basic(auth[0], auth[1]));
app.set('neo4j', driver.session());

let Neo4jStore = require('connect-neo4j')(session)
// session setup
app.use(session({
  // Neo4j store
  store: new Neo4jStore({client: driver}),
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
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// set up authentication routes
app.use(authRouter);

// restrict other routes to authenticated users only
app.use(async (req, res, next) => {
  if(req.session && req.session.username) next();
  /* Helpful for development
  else {
    console.log('logging in with fake cred...');
    req.session.username = 'nhbean';  
    const neo4j = req.app.get('neo4j');
    await neo4j.run('MERGE (user:User {username: $username})', {username: 'nhbean'});
    // Then redirect them to the landing page 
    res.redirect('/');
  }
  */
  // If not, redirect them to the login page
  else res.redirect('/login');
})

// define protected routes
app.use('/', indexRouter);
app.use(usersRouter);
app.use(codesRouter);
app.use(documentsRouter);
app.use('/projects', projectsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
