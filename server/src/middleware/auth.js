import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from './asyncHandler.js';
import prisma from '../config/prisma.js';

/**
 * Middleware to authenticate user via JWT token
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided, authorization denied');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        is_deleted: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true
      }
    });

    if (!user) {
      throw new ApiError(401, 'User not found or has been deleted');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    throw error;
  }
});

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        is_deleted: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true
      }
    });

    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
});

export default {
  authenticate,
  optionalAuth
};

