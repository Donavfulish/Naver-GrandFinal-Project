// src/config/logger.js
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NODE_ENV } from './env.js';

// Chuyển import.meta.url -> __dirname chuẩn
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục logs (nằm ngoài src)
const logsDir = path.join(__dirname, '../../logs');

// Tạo thư mục logs nếu chưa có
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Định nghĩa màu sắc cho console
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Format console (có màu)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Format file (json, stack trace)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Tạo Winston logger
const logger = winston.createLogger({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  levels: winston.config.npm.levels,
  transports: [
    // Console output
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

// Helper log request
logger.logRequest = (req) => {
  logger.http(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
};

// Helper log response
logger.logResponse = (req, res, responseTime) => {
  logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`);
};

// Helper log error
logger.logError = (error, context = '') => {
  logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
    stack: error.stack,
    ...error,
  });
};

export default logger;
