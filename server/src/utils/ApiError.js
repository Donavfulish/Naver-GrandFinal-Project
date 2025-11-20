import { AppError } from './errorHandler.js';

/**
 * ApiError - Alias for AppError with simpler constructor
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;

