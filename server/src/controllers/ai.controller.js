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

/**
 * POST /api/ai/mind
 * Generate user mind description based on their 10 most recent spaces
 * @body {string} userId - ID of the user
 */
export const mind = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, 'userId is required');
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId, is_deleted: false },
    select: { id: true, mind: true }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Generate mind description based on user's 10 most recent spaces
  const result = await aiService.generateUserMind(userId);

  res.status(200).json({
    success: true,
    message: 'User mind generated successfully',
    data: {
      mind: result.mind
    }
  });
});

export default {
  generate,
  checkout,
  mind
};
