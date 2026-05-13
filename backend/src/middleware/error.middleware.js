function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
