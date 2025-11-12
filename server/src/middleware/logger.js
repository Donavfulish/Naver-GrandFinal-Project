import logger from '../config/logger.js';

/**
 * Middleware để log tất cả requests
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.logRequest(req);

  // Lắng nghe khi response được gửi
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logResponse(req, res, responseTime);
  });

  next();
};

/**
 * Middleware để xử lý errors và log
 */
const errorLogger = (err, req, res, next) => {
  // Log error với context
  logger.logError(err, `${req.method} ${req.originalUrl}`);

  // Gửi response lỗi
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.details,
      }),
    },
  });
};

/**
 * Middleware để handle 404
 */
const notFoundLogger = (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl,
    },
  });
};

export {
  requestLogger,
  errorLogger,
  notFoundLogger,
};
