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
 * POST /api/ai/checkout
 * Generate context-aware reflection for emotional checkout
 * @body {string} spaceId - ID of the space
 * @body {number} duration - Duration of the session in seconds
 */
export const checkout = asyncHandler(async (req, res) => {
  const { spaceId } = req.body;

  if (!spaceId) {
    throw new ApiError(400, 'spaceId is required');
  }

  // Now call checkout service which will read mood and duration from space
  const reflection = await aiService.checkout(spaceId);

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
