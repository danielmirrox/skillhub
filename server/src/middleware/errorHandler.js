function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || err.status || 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Unexpected server error',
  });
}

module.exports = { errorHandler };
