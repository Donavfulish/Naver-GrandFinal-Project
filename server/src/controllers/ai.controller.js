import aiService from '../services/ai.service.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/prisma.js';

/**
 * POST /api/ai/generate
 * Generate AI space based on user prompt
 */
export const generate = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  console.log('Received generate request with prompt:', prompt);

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
 * @body {string} userId - ID of the user
 * @body {string} name - Name of the space
 * @body {string} description - Description of the space (optional)
 * @body {string} backgroundId - ID of the background
 * @body {string} clockFontId - ID of the clock font
 * @body {string} textFontId - ID of the text font
 * @body {Array<string>} tracks - Array of track IDs (optional)
 * @body {string} prompt - Original AI prompt (optional)
 * @body {Array<string>} tags - Array of tag names (optional)
 */
export const confirmGenerate = asyncHandler(async (req, res) => {
  const {
    userId,
    name,
    description,
    backgroundId,
    clockFontId,
    textFontId,
    tracks,
    prompt,
    tags,
    mood
  } = req.body;

  // Validate required fields
  if (!userId) {
    throw new ApiError(400, 'userId is required');
  }
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ApiError(400, 'name is required and must be a non-empty string');
  }
  if (!backgroundId) {
    throw new ApiError(400, 'backgroundId is required');
  }
  if (!clockFontId) {
    throw new ApiError(400, 'clockFontId is required');
  }
  if (!textFontId) {
    throw new ApiError(400, 'textFontId is required');
  }
  if (!mood || typeof mood !== 'string' || mood.trim().length === 0) {
    throw new ApiError(400, 'mood is required and must be a non-empty string');
  }

  // Prepare space data
  const spaceData = {
    userId,
    name,
    description: description || null,
    backgroundId,
    clockFontId,
    textFontId,
    tracks: Array.isArray(tracks) ? tracks : [],
    prompt: prompt || null,
    tags: Array.isArray(tags) ? tags : [],
    mood
  };

  // Save to database
  const savedSpace = await aiService.saveGeneratedSpace(spaceData);

  res.status(201).json({
    success: true,
    message: 'Space created successfully',
    data: savedSpace
  });
});


/**
 * POST /api/ai/checkout
 * Generate context-aware reflection for emotional checkout
 * @body {string} spaceId - ID of the space
 * @body {number} duration - Duration of the session in seconds
 */
export const checkout = asyncHandler(async (req, res) => {
  const { spaceId, duration } = req.body;

  if (!spaceId) {
    throw new ApiError(400, 'spaceId is required');
  }

  if (duration === undefined || duration === null) {
    throw new ApiError(400, 'duration is required');
  }

  // Update duration to database first
  await prisma.space.update({
    where: { id: spaceId },
    data: { duration }
  });

  // Now call checkout service which will read mood from space
  const reflection = await aiService.checkout(spaceId, { duration });

  res.status(200).json({
    success: true,
    message: 'Reflection generated successfully',
    data: reflection
  });
});

export default {
  generate,
  confirmGenerate,
  checkout
};
