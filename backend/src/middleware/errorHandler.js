const { winstonLogger } = require('./logger');

const errorHandler = (err, req, res, next) => {
  winstonLogger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An error occurred' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = { errorHandler };