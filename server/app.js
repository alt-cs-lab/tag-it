// Libraries
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const neo4j = require('neo4j-driver')

const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api')
const indexRouter = require('./routes/index');
//const usersRouter = require('./routes/api/users');
const projectsRouter = require('./routes/api/projects');
const documentsRouter = require('./routes/documents');
const codesRouter = require('./routes/codes');

// Logger
const logger = require('./configs/logger')

const app = express();

// database setup
const db = require('./configs/neo4j')
app.set('neo4j', db);

// session setup
const session = require('./configs/session')
app.use(session)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV == 'development') {
  app.use('/', indexRouter)

}

// Routers


// Auth routes must come first
app.use('/auth', authRouter);

// Redirect other requests to Vue app
//app.use(history())

// Serve static resources
app.use(express.static(path.join(__dirname, 'public')));

// Handle API routes last
app.use('/api/v1', apiRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
