import userService from '../services/user.service.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ErrorCodes } from '../constants/errorCodes.js';

const userController = {
  // GET /api/users/:id - Get user by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: {
          code: ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        },
      });
    }
  }),


  // GET /api/users/:id/spaces - Get spaces by user ID
  getSpacesByUserId: asyncHandler(async (req, res) => {
      const { id } = req.params;
      try {
          const spaces = await userService.getSpacesByUserId(id);
          res.status(200).json({
              success: true,
              data: spaces,
          });
      } catch (error) {
          return res.status(500).json({
              success: false,
              error: {
                  code: ErrorCodes.USER_SPACES_FETCH_FAILED,
                  message: 'Failed to fetch user spaces',
              },
          });
      }
  }),

  // PUT /api/users/:id/name - Update user name
  updateName: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
      const user = await userService.updateUser(id, { name });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.USER_UPDATE_FAILED,
          message: 'Failed to update user name',
        },
      });
    }
  }),

  // PUT /api/users/:id/email - Update user email
  updateEmail: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    try {
      const user = await userService.updateUser(id, { email });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.USER_UPDATE_FAILED,
          message: 'Failed to update user email',
        },
      });
    }
  }),

  // PUT /api/users/:id/avatar - Update user avatar
  updateAvatar: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { avatar_url } = req.body;

    try {
      // TODO: Implement avatar upload logic (file handling)
      const user = await userService.updateUser(id, { avatar_url });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.USER_UPDATE_FAILED,
          message: 'Failed to update user avatar',
        },
      });
    }
  }),

  // PUT /api/users/:id/password - Update user password
  updatePassword: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
        const user = await userService.updateUser(id, { password });
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({
                success: false,
                error: {
                    code: ErrorCodes.USER_NOT_FOUND,
                    message: 'User not found',
                },
            });
        }
    }
  }),

  // DELETE /api/users/:id - Delete user
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        data: { message: 'User deleted successfully' },
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.USER_DELETE_FAILED,
          message: 'Failed to delete user',
        },
      });
    }
  }),
};

export default userController;

