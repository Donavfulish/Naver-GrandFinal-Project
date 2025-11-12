// middleware/errorHandler.js
import logger from '../config/logger.js';
import { AppError, ErrorCodes } from '../utils/errorHandler.js';

/**
 * Global Error Handler Middleware
 * @param {any} err - Error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorHandlerMiddleware = (err, req, res, next) => {
    logger.error('Error occurred:', {
        message: err.message,
        code: err.code || 'UNKNOWN',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json(err.toJSON());
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: { code: ErrorCodes.AUTH_INVALID_TOKEN, message: 'Invalid token' }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: { code: ErrorCodes.AUTH_TOKEN_EXPIRED, message: 'Token expired' }
        });
    }

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                error: { code: ErrorCodes.FILE_TOO_LARGE, message: 'File too large' }
            });
        }
        return res.status(500).json({
            success: false,
            error: { code: ErrorCodes.FILE_UPLOAD_FAILED, message: 'File upload failed' }
        });
    }

    if (err.code && err.code.startsWith('P')) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: { code: ErrorCodes.VALIDATION_FAILED, message: 'Unique constraint violation' }
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: { code: ErrorCodes.USER_NOT_FOUND, message: 'Record not found' }
            });
        }
        return res.status(500).json({
            success: false,
            error: { code: ErrorCodes.DATABASE_ERROR, message: 'Database error' }
        });
    }

    return res.status(500).json({
        success: false,
        error: {
            code: ErrorCodes.SERVER_ERROR,
            message: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        }
    });
};

export default errorHandlerMiddleware;
