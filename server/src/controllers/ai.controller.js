import aiService from '../services/ai.service.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * POST /api/ai/generate
 * Generate AI space based on user prompt
 */
export const generate = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new ApiError(400, 'Prompt is required and must be a non-empty string');
  }

  // Generate space based on prompt
  const generatedSpace = await aiService.generateSpace(prompt);

  res.status(200).json({
    success: true,
    message: 'Space generated successfully',
    data: generatedSpace
  });
});

/**
 * POST /api/ai/generate/confirm
 * Confirm and save generated space to user's account
 */
export const confirmGenerate = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Assuming auth middleware sets req.user
  const { generatedSpace } = req.body;

  if (!generatedSpace) {
    throw new ApiError(400, 'Generated space data is required');
  }

  // Validate generated space structure
  if (!generatedSpace.name || !generatedSpace.background?.id ||
      !generatedSpace.clock_font?.id || !generatedSpace.text_font?.id) {
    throw new ApiError(400, 'Invalid generated space data');
  }

  // Save to database
  const savedSpace = await aiService.saveGeneratedSpace(userId, generatedSpace);

  res.status(201).json({
    success: true,
    message: 'Space created successfully',
    data: savedSpace
  });
});

export default {
  generate,
  confirmGenerate
};

