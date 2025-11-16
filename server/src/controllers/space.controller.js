import spaceService from '../services/space.service.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ErrorCodes } from '../constants/errorCodes.js';

const spaceController = {
  // GET /api/space - Get all spaces with optional filtering
  getAll: asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.user_id) {
      filters.user_id = req.query.user_id;
    }

    const spaces = await spaceService.getAllSpaces(filters);

    res.status(200).json({
      success: true,
      data: spaces,
    });
  }),

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

  // PATCH /api/space/:id - Update space (metadata, appearance, tags, playlists, widgets)
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
};

export default spaceController;

