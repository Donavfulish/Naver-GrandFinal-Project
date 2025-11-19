import spaceRepository from '../db/repositories/space.repository.js';
import tagRepository from '../db/repositories/tag.repository.js';
import playlistRepository from '../db/repositories/playlist.repository.js';
import backgroundRepository from '../db/repositories/background.repository.js';
import clockFontRepository from '../db/repositories/clockFont.repository.js';
import textFontRepository from '../db/repositories/textFont.repository.js';
import {ErrorCodes} from '../constants/errorCodes.js';
import logger from '../config/logger.js';
import prisma from '../config/prisma.js';

const spaceService = {
  async createSpace(data) {
    const {
      user_id,
      name,
      tags, // Array of tag names (strings), not IDs
      description,
      background_url,
      clock_font_id,
      text_font_id,
      tracks = [], // Array of track IDs
      prompt = null,
    } = data;

    // Validate tags exist and are not empty
    if (!tags || tags.length === 0) {
      const error = new Error('At least one tag is required');
      error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
      throw error;
    }

    // Validate tags are strings
    if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) {
      const error = new Error('Tags must be an array of strings (tag names)');
      error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
      error.statusCode = 422;
      throw error;
    }

    // Find or create tags and get their IDs
    const tagIds = [];
    for (const tagName of tags) {
      const tag = await tagRepository.findOrCreate(tagName.trim());
      tagIds.push(tag.id);
    }

    // Handle background URL
    let validatedBackgroundId = null;

    if (background_url) {
      try {
        // Check if background with this URL already exists
        const existingBackground = await prisma.background.findFirst({
          where: {
            background_url: background_url,
            is_deleted: false
          }
        });

        if (existingBackground) {
          // Use existing background
          validatedBackgroundId = existingBackground.id;
          logger.info(`Using existing background with URL: ${background_url}`);
        } else {
          // Create new background record with the provided URL
          const newBackground = await backgroundRepository.create({
            background_url: background_url,
          });

          validatedBackgroundId = newBackground.id;
          logger.info(`Background created for space with URL: ${background_url}`);
        }
      } catch (error) {
        logger.error(`Failed to handle background: ${error.message}`);
        const err = new Error(`Failed to handle background: ${error.message}`);
        err.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        err.statusCode = 400;
        throw err;
      }
    } else {
      // Get default background
      const defaultBackground = await backgroundRepository.findAll();
      if (defaultBackground.length > 0) {
        validatedBackgroundId = defaultBackground[0].id;
      }
    }

    // Validate and set clock font (or use default)
    let validatedClockFontId = clock_font_id;
    if (clock_font_id) {
      const clockFont = await clockFontRepository.findById(clock_font_id);
      if (!clockFont || clockFont.is_deleted) {
        const error = new Error('Invalid clock font ID');
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        error.statusCode = 422;
        throw error;
      }
    } else {
      const defaultClockFont = await clockFontRepository.getDefault();
      if (defaultClockFont) {
        validatedClockFontId = defaultClockFont.id;
      }
    }

    // Validate and set text font (or use default)
    let validatedTextFontId = text_font_id;
    if (text_font_id) {
      const textFont = await textFontRepository.findById(text_font_id);
      if (!textFont || textFont.is_deleted) {
        const error = new Error('Invalid text font ID');
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        error.statusCode = 422;
        throw error;
      }
    } else {
      const defaultTextFont = await textFontRepository.getDefault();
      if (defaultTextFont) {
        validatedTextFontId = defaultTextFont.id;
      }
    }

    // Validate tracks (if provided)
    if (tracks.length > 0) {
      // Validate that all tracks exist
      const trackValidations = await Promise.all(
        tracks.map(async (trackId) => {
          const track = await prisma.track.findUnique({
            where: { id: trackId, is_deleted: false }
          });
          if (!track) {
            return { valid: false, trackId };
          }
          return { valid: true, trackId };
        })
      );

      const invalidTracks = trackValidations.filter(t => !t.valid);
      if (invalidTracks.length > 0) {
        const error = new Error(
          `Invalid or deleted track IDs: ${invalidTracks.map(t => t.trackId).join(', ')}`
        );
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        error.statusCode = 422;
        throw error;
      }
    }

    // Prepare space data
    const spaceData = {
      user_id,
      name,
      description: description || null,
      background_id: validatedBackgroundId,
      clock_font_id: validatedClockFontId,
      text_font_id: validatedTextFontId,
    };

    // Create space with all relations (pass tracks instead of playlist_ids)
    const createdSpace = await spaceRepository.create(
        spaceData,
        tagIds,
        tracks
    );

    // Save AI generated content info if prompt exists and is not empty
    if (prompt && prompt.trim().length > 0) {
      await prisma.aiGeneratedContent.create({
        data: {
          space_id: createdSpace.id,
          prompt: prompt,
          content: JSON.stringify({
            user_id,
            name,
            description,
            background_id: validatedBackgroundId,
            clock_font_id: validatedClockFontId,
            text_font_id: validatedTextFontId,
            tags, // Store original tag names
            tracks,
          })
        }
      });
    }

    return createdSpace;
  },

  async getSpaceById(id) {
    const space = await spaceRepository.findById(id);
    if (!space || space.is_deleted) {
      const error = new Error('Space not found');
      error.code = ErrorCodes.SPACE_NOT_FOUND;
      throw error;
    }
    return space;
  },

  async getAllSpaces(filters) {
    return await spaceRepository.findAll(filters);
  },

  async updateSpace(id, data) {
    // Check if space exists
    const space = await spaceRepository.findById(id);
    if (!space || space.is_deleted) {
      const error = new Error('Space not found');
      error.code = ErrorCodes.SPACE_NOT_FOUND;
      throw error;
    }

    const {
      metadata,
      appearance,
      tags, // Array of tag names (strings), not IDs
      playlist_links,
    } = data;

    const spaceData = {};
    let tagIds = null;
    let playlistLinksAdd = [];
    let playlistLinksRemove = [];

    // Process metadata updates
    if (metadata) {
      if (metadata.name !== undefined) {
        spaceData.name = metadata.name;
      }
      if (metadata.description !== undefined) {
        spaceData.description = metadata.description;
      }
    }

    // Process appearance updates
    if (appearance) {
      // Handle background URL
      if (appearance.background_url !== undefined) {
        if (appearance.background_url) {
          try {
            // Create new background record with the provided URL
            const newBackground = await backgroundRepository.create({
              background_url: appearance.background_url,
            });

            spaceData.background_id = newBackground.id;
            logger.info(`Background created for space update with URL: ${appearance.background_url}`);
          } catch (error) {
            logger.error(`Failed to create background: ${error.message}`);
            const err = new Error(`Failed to create background: ${error.message}`);
            err.code = ErrorCodes.SPACE_VALIDATION_FAILED;
            err.statusCode = 400;
            throw err;
          }
        } else {
          spaceData.background_id = null;
        }
      }

      if (appearance.clock_font_id !== undefined) {
        if (appearance.clock_font_id) {
          const clockFont = await clockFontRepository.findById(appearance.clock_font_id);
          if (!clockFont || clockFont.is_deleted) {
            const error = new Error('Invalid clock font ID');
            error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
            error.statusCode = 422;
            throw error;
          }
        }
        spaceData.clock_font_id = appearance.clock_font_id;
      }

      if (appearance.text_font_id !== undefined) {
        if (appearance.text_font_id) {
          const textFont = await textFontRepository.findById(appearance.text_font_id);
          if (!textFont || textFont.is_deleted) {
            const error = new Error('Invalid text font ID');
            error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
            error.statusCode = 422;
            throw error;
          }
        }
        spaceData.text_font_id = appearance.text_font_id;
      }
    }

    // Process tags update
    if (tags !== undefined) {
      if (!tags || tags.length === 0) {
        const error = new Error('At least one tag is required');
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        throw error;
      }

      // Validate tags are strings
      if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) {
        const error = new Error('Tags must be an array of strings (tag names)');
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        error.statusCode = 422;
        throw error;
      }

      // Find or create tags and get their IDs
      tagIds = [];
      for (const tagName of tags) {
        const tag = await tagRepository.findOrCreate(tagName.trim());
        tagIds.push(tag.id);
      }
    }

    // Process playlist links
    if (playlist_links) {
      if (playlist_links.add) {
        // Validate playlists to add
        const playlistValidations = await Promise.all(
          playlist_links.add.map(async (playlistId) => {
            const playlist = await playlistRepository.findById(playlistId);
            if (!playlist || playlist.is_deleted) {
              return { valid: false, playlistId, reason: 'not found or deleted' };
            }
            if (playlist.space_id && playlist.space?.user_id !== space.user_id) {
              return { valid: false, playlistId, reason: 'belongs to another user' };
            }
            return { valid: true, playlistId };
          })
        );

        const invalidPlaylists = playlistValidations.filter(p => !p.valid);
        if (invalidPlaylists.length > 0) {
          const error = new Error(
            `Invalid playlist IDs: ${invalidPlaylists.map(p => `${p.playlistId} (${p.reason})`).join(', ')}`
          );
          error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
          error.statusCode = 422;
          throw error;
        }

        playlistLinksAdd = playlist_links.add;
      }

      if (playlist_links.remove) {
        playlistLinksRemove = playlist_links.remove;
      }
    }

    // Perform update
    return await spaceRepository.update(
        id,
        spaceData,
        tagIds,
        playlistLinksAdd,
        playlistLinksRemove
    );
  },

  async deleteSpace(id) {
    const space = await spaceRepository.findById(id);
    if (!space || space.is_deleted) {
      const error = new Error('Space not found');
      error.code = ErrorCodes.SPACE_NOT_FOUND;
      throw error;
    }
    await spaceRepository.delete(id);
    return { message: 'Space deleted successfully' };
  },

  async searchSpaces(searchParams) {
    const { q, title, tag, author, limit, offset } = searchParams;

    // Validate tag exists if provided
    if (tag) {
      const tagExists = await tagRepository.findById(tag);
      if (!tagExists || tagExists.is_deleted) {
        const error = new Error('Invalid tag ID');
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        error.statusCode = 422;
        throw error;
      }
    }

    // Search spaces
    return await spaceRepository.search({
      q,
      title,
      tag,
      author,
      limit,
      offset,
    });
  },

  /**
   * Get all clock fonts
   * @returns {Promise<Array>} List of clock fonts
   */
  async getClockFonts() {
    return await clockFontRepository.findAll();
  },

  /**
   * Get all text fonts
   * @returns {Promise<Array>} List of text fonts
   */
  async getTextFonts() {
    return await textFontRepository.findAll();
  },

  /**
   * Update space summary (duration, AI content, mood)
   * @param {string} id - Space ID
   * @param {Object} summaryData - Summary data
   * @param {number} summaryData.duration - Space duration in seconds
   * @param {string} summaryData.content - AI generated content
   * @param {string} summaryData.mood - Mood/emotion
   * @returns {Promise<Object>} Updated space
   */
  async updateSpaceSummary(id, summaryData) {
    const { duration, content, mood } = summaryData;

    // Check if space exists
    const space = await spaceRepository.findById(id);
    if (!space || space.is_deleted) {
      const error = new Error('Space not found');
      error.code = ErrorCodes.SPACE_NOT_FOUND;
      throw error;
    }

    // Validate inputs
    if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
      const error = new Error('Duration must be a non-negative number');
      error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
      throw error;
    }

    if (mood && typeof mood !== 'string') {
      const error = new Error('Mood must be a string');
      error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
      throw error;
    }

    if (content && typeof content !== 'string') {
      const error = new Error('Content must be a string');
      error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
      throw error;
    }

    // Update space duration if provided
    if (duration !== undefined) {
      await prisma.space.update({
        where: { id },
        data: { duration },
      });
    }

    // Update or create AiGeneratedContent if content or mood provided
    if (content !== undefined || mood !== undefined) {
      // Check if AI generated content already exists for this space
      const existingAiContent = await prisma.aiGeneratedContent.findFirst({
        where: { space_id: id },
      });

      if (existingAiContent) {
        // Update existing record
        const updateData = {};
        if (content !== undefined) updateData.content = content;
        if (mood !== undefined) updateData.mood = mood;
        updateData.updated_at = new Date();

        await prisma.aiGeneratedContent.update({
          where: { id: existingAiContent.id },
          data: updateData,
        });
      } else {
        // Create new record if it doesn't exist
        await prisma.aiGeneratedContent.create({
          data: {
            space_id: id,
            prompt: null,
            mood: mood || 'Neutral',
            content: content || '',
          },
        });
      }
    }

    // Return updated space with all relations
    return await spaceRepository.findById(id);
  },
};

export default spaceService;
