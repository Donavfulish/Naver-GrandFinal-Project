import { ErrorCodes, ErrorStatusCodes } from '../constants/errorCodes.js';

/**
 * Custom Application Error
 * Standardized error class for the entire application
 * @param {string} code - Error code from ErrorCodes
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code (optional, defaults from ErrorStatusCodes)
 */
class AppError extends Error {
    constructor(code, message, statusCode = null) {
        super(message || code);
        this.name = 'AppError';
        this.code = code;
        this.message = message || code;
        this.statusCode = statusCode || ErrorStatusCodes[code] || 500;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            error: {
                code: this.code,
                message: this.message
            }
        };
    }
}

/**
 * Error Response Helper
 * Deprecated - use AppError with throw instead
 */
class ErrorResponse {
    static send(res, code, message = null) {
        const statusCode = ErrorStatusCodes[code] || 500;
        return res.status(statusCode).json({
            success: false,
            error: {
                code: code,
                message: message || code
            }
        });
    }

    static sendValidationError(res, message, details = null) {
        return res.status(400).json({
            success: false,
            error: {
                code: ErrorCodes.VALIDATION_FAILED,
                message: message || 'Validation failed',
                details: details
            }
        });
    }

    static sendServerError(res, error = null) {
        return res.status(500).json({
            success: false,
            error: {
                code: ErrorCodes.SERVER_ERROR,
                message: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error?.message : undefined
            }
        });
    }
}

export {
    AppError,
    ErrorResponse,
    ErrorCodes,
};
