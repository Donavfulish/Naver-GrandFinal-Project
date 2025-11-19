import spaceService from '../services/space.service.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ErrorCodes } from '../constants/errorCodes.js';

const spaceController = {
  // GET /api/space/:id - Get space by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const space = await spaceService.getSpaceById(id);

      res.status(200).json({
        success: true,
        data: space,
      });
    } catch (error) {
      if (error.code === ErrorCodes.SPACE_NOT_FOUND) {
        return res.status(404).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_NOT_FOUND,
          message: 'Failed to retrieve space',
        },
      });
    }
  }),

  // POST /api/space - Create new space
  create: asyncHandler(async (req, res) => {
    try {
      const space = await spaceService.createSpace(req.body);

      res.status(201).json({
        success: true,
        data: space,
      });
    } catch (error) {
      // Handle specific validation errors
      if (error.code === ErrorCodes.SPACE_VALIDATION_FAILED) {
        return res.status(error.statusCode || 400).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      // Handle general creation errors
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_CREATE_FAILED,
          message: 'Failed to create space',
          details: error.message,
        },
      });
    }
  }),

  // DELETE /api/space/:id - Soft delete space
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      await spaceService.deleteSpace(id);

      res.status(200).json({
        success: true,
        data: { message: 'Space deleted successfully' },
      });
    } catch (error) {
      if (error.code === ErrorCodes.SPACE_NOT_FOUND) {
        return res.status(404).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_DELETE_FAILED,
          message: 'Failed to delete space',
          details: error.message,
        },
      });
    }
  }),

  // PATCH /api/space/:id - Update space
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const space = await spaceService.updateSpace(id, req.body);

      res.status(200).json({
        success: true,
        data: space,
      });
    } catch (error) {
      if (error.code === ErrorCodes.SPACE_NOT_FOUND) {
        return res.status(404).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      if (error.code === ErrorCodes.SPACE_VALIDATION_FAILED) {
        return res.status(error.statusCode || 400).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_UPDATE_FAILED,
          message: 'Failed to update space',
          details: error.message,
        },
      });
    }
  }),

  // GET /api/space/fonts/clock - Get all clock fonts
  getClockFonts: asyncHandler(async (req, res) => {
    try {
      const clockFonts = await spaceService.getClockFonts();

      res.status(200).json({
        success: true,
        data: clockFonts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SERVER_ERROR,
          message: 'Failed to retrieve clock fonts',
          details: error.message,
        },
      });
    }
  }),

  // GET /api/space/fonts/text - Get all text fonts
  getTextFonts: asyncHandler(async (req, res) => {
    try {
      const textFonts = await spaceService.getTextFonts();

      res.status(200).json({
        success: true,
        data: textFonts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SERVER_ERROR,
          message: 'Failed to retrieve text fonts',
          details: error.message,
        },
      });
    }
  }),
};

export default spaceController;
