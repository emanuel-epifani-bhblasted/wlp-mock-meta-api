var express = require('express');
var path = require('path');
var logger = require('morgan');

var metaApiRouter = require('./routes/meta-api');

var app = express();

// Log richieste essenziali
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body));
  }
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', metaApiRouter);

// Gestione errori base
app.use(function(req, res, next) {
  res.status(404).json({
    error: {
      message: 'Not Found',
      type: 'EndpointNotFound',
      code: 404
    }
  });
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      type: err.name || 'ServerError',
      code: err.status || 500
    }
  });
});

module.exports = app;
