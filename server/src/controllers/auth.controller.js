import userService from '../services/user.service.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ErrorCodes } from '../constants/errorCodes.js';

const authController = {
  // POST /api/auth/signup - Register new user
  signup: asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const user = await userService.register(name, email, password);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          error: {
            code: ErrorCodes.AUTH_EMAIL_ALREADY_EXISTS,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }),

  // POST /api/auth/login - Login user
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await userService.login(email, password);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        },
      });
    }
  }),
};

export default authController;
