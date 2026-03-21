function notFoundHandler(_req, res) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Route not found.',
  });
}

module.exports = { notFoundHandler };
