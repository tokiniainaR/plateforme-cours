export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || res.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Erreur interne du serveur.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
