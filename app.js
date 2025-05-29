var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var metaApiRouter = require('./routes/meta-api');
var testRouter = require('./routes/test-route');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Log dettagliato delle richieste
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query Params:', req.query);
  }
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', metaApiRouter);
app.use('/', testRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Per le richieste API, ritorna un errore JSON formattato
  if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.path.startsWith('/v18.0/')) {
    return res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal Server Error',
        type: err.name || 'ServerError',
        code: err.status || 500
      }
    });
  }

  // render the error page per richieste non-API
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
