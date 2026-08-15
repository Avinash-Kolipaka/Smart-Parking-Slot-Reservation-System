const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = 'SERVER_ERROR';

  logger.error(`Error [${req.method} ${req.url}]: ${err.message}`, { 
    stack: err.stack,
    requestId: req.id,
    errorCode,
    statusCode
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
    errorCode = 'NOT_FOUND';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token';
    statusCode = 401;
    errorCode = 'AUTH_ERROR';
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token expired';
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    requestId: req.id,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  next(error);
};

module.exports = { errorHandler, notFound };
