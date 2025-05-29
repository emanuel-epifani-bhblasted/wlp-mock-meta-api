/**
 * Middleware per garantire che tutte le risposte di errore abbiano
 * un formato uniforme con un campo message.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${req.method} ${req.url} - ${statusCode} ${errorMessage}`);

  // Formatta la risposta di errore in modo uniforme
  res.status(statusCode).json({
    error: {
      message: errorMessage,
      type: err.name || 'ServerError',
      code: statusCode
    }
  });
}

module.exports = errorHandler;
