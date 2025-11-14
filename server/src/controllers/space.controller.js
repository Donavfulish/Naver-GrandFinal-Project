import spaceService from '../services/space.service.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ErrorCodes } from '../constants/errorCodes.js';

const spaceController = {
  // GET /api/spaces - Get all spaces
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

  // GET /api/spaces/:id - Get space by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const space = await spaceService.getSpaceById(id);

      res.status(200).json({
        success: true,
        data: space,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_NOT_FOUND,
          message: 'Space not found',
        },
      });
    }
  }),

  // POST /api/spaces - Create new space
  create: asyncHandler(async (req, res) => {
    try {
      const space = await spaceService.createSpace(req.body);

      res.status(201).json({
        success: true,
        data: space,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_CREATE_FAILED,
          message: 'Failed to create space',
        },
      });
    }
  }),

  // POST /api/spaces/text - Create space from text input
  createFromText: asyncHandler(async (req, res) => {
    const { user_id, text_input } = req.body;

    try {
      // TODO: Implement AI/NLP processing to parse text_input
      // Extract: title, description, preferences, etc.
      // For now, create a basic space with the text as description

      const spaceData = {
        user_id,
        title: 'Space from Text',
        description: text_input,
      };

      const space = await spaceService.createSpace(spaceData);

      res.status(201).json({
        success: true,
        data: space,
        message: 'Space created from text input',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_CREATE_FAILED,
          message: 'Failed to create space from text',
        },
      });
    }
  }),

  // POST /api/spaces/voice - Create space from voice input
  createFromVoice: asyncHandler(async (req, res) => {
    const { user_id, audio_url, audio_data } = req.body;

    try {
      // TODO: Implement voice-to-text conversion (e.g., using Google Speech-to-Text, AWS Transcribe)
      // TODO: Then process the transcribed text like createFromText
      // For now, return a placeholder response

      const spaceData = {
        user_id,
        title: 'Space from Voice',
        description: 'Created from voice input',
      };

      const space = await spaceService.createSpace(spaceData);

      res.status(201).json({
        success: true,
        data: space,
        message: 'Space created from voice input (prototype)',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_CREATE_FAILED,
          message: 'Failed to create space from voice',
        },
      });
    }
  }),

  // PUT /api/spaces/:id/description - Update space description
  updateDescription: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    try {
      const space = await spaceService.updateSpace(id, { description });

      res.status(200).json({
        success: true,
        data: space,
      });
    } catch (error) {
      if (error.message === 'Space not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.SPACE_NOT_FOUND,
            message: 'Space not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_UPDATE_FAILED,
          message: 'Failed to update space description',
        },
      });
    }
  }),

  // PUT /api/spaces/:id/font-text - Update text font
  updateFontText: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text_font_name } = req.body;

    try {
      const space = await spaceService.updateSpace(id, { text_font_name });

      res.status(200).json({
        success: true,
        data: space,
      });
    } catch (error) {
      if (error.message === 'Space not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.SPACE_NOT_FOUND,
            message: 'Space not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_UPDATE_FAILED,
          message: 'Failed to update text font',
        },
      });
    }
  }),

  // PUT /api/spaces/:id/font-clock - Update clock font
  updateFontClock: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { clock_font_id } = req.body;

    try {
      const space = await spaceService.updateSpace(id, { clock_font_id });

      res.status(200).json({
        success: true,
        data: space,
      });
    } catch (error) {
      if (error.message === 'Space not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.SPACE_NOT_FOUND,
            message: 'Space not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_UPDATE_FAILED,
          message: 'Failed to update clock font',
        },
      });
    }
  }),

  // PUT /api/spaces/:id/background - Update background
  updateBackground: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { background_id } = req.body;

    try {
      // TODO: Implement background file upload logic if needed
      const space = await spaceService.updateSpace(id, { background_id });

      res.status(200).json({
        success: true,
        data: space,
      });
    } catch (error) {
      if (error.message === 'Space not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.SPACE_NOT_FOUND,
            message: 'Space not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_UPDATE_FAILED,
          message: 'Failed to update background',
        },
      });
    }
  }),

  // PUT /api/spaces/:id/position - Update widget positions
  updatePosition: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { positions } = req.body;

    try {
      // TODO: Implement position update logic (update widget_positions table)
      // For now, just return success as prototype

      res.status(200).json({
        success: true,
        data: { message: 'Positions updated successfully' },
      });
    } catch (error) {
      if (error.message === 'Space not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.SPACE_NOT_FOUND,
            message: 'Space not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_UPDATE_FAILED,
          message: 'Failed to update positions',
        },
      });
    }
  }),

  // DELETE /api/spaces/:id - Delete space
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      await spaceService.deleteSpace(id);

      res.status(200).json({
        success: true,
        data: { message: 'Space deleted successfully' },
      });
    } catch (error) {
      if (error.message === 'Space not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.SPACE_NOT_FOUND,
            message: 'Space not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_DELETE_FAILED,
          message: 'Failed to delete space',
        },
      });
    }
  }),

  // POST /api/spaces/:id/fork - Fork a space
  fork: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    try {
      // TODO: Implement fork logic (duplicate space for new user)

      res.status(201).json({
        success: true,
        data: { message: 'Space forked successfully' },
      });
    } catch (error) {
      if (error.message === 'Space not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.SPACE_NOT_FOUND,
            message: 'Space not found',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_FORK_FAILED,
          message: 'Failed to fork space',
        },
      });
    }
  }),

  // DELETE /api/spaces/:id/fork/:forkId - Delete forked space
  deleteFork: asyncHandler(async (req, res) => {
    const { id, forkId } = req.params;

    try {
      // TODO: Implement delete fork logic

      res.status(200).json({
        success: true,
        data: { message: 'Forked space deleted successfully' },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_DELETE_FAILED,
          message: 'Failed to delete forked space',
        },
      });
    }
  }),
};

export default spaceController;
