import spaceRepository from '../db/repositories/space.repository.js';
import tagRepository from '../db/repositories/tag.repository.js';
import playlistRepository from '../db/repositories/playlist.repository.js';
import backgroundRepository from '../db/repositories/background.repository.js';
import clockFontRepository from '../db/repositories/clockFont.repository.js';
import textFontRepository from '../db/repositories/textFont.repository.js';
import {ErrorCodes} from '../constants/errorCodes.js';

const spaceService = {
  async createSpace(data) {
    const {
      user_id,
      name,
      tags,
      description,
      background_id,
      clock_font_id,
      text_font_name,
      playlist_ids = [],
      widget_positions = [],
    } = data;

    // Validate tags exist and are not deleted
    if (!tags || tags.length === 0) {
      const error = new Error('At least one tag is required');
      error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
      throw error;
    }

    const tagValidations = await Promise.all(
      tags.map(async (tagId) => {
        const tag = await tagRepository.findById(tagId);
        if (!tag || tag.is_deleted) {
          return { valid: false, tagId };
        }
        return { valid: true, tagId };
      })
    );

    const invalidTags = tagValidations.filter(t => !t.valid);
    if (invalidTags.length > 0) {
      const error = new Error(`Invalid or deleted tag IDs: ${invalidTags.map(t => t.tagId).join(', ')}`);
      error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
      error.statusCode = 422;
      throw error;
    }

    // Validate and set background (or use default)
    let validatedBackgroundId = background_id;
    if (background_id) {
      const background = await backgroundRepository.findById(background_id);
      if (!background || background.is_deleted) {
        const error = new Error('Invalid background ID');
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        error.statusCode = 422;
        throw error;
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
    let validatedTextFontName = text_font_name;
    if (text_font_name) {
      const textFont = await textFontRepository.findById(text_font_name);
      if (!textFont || textFont.is_deleted) {
        const error = new Error('Invalid text font name');
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        error.statusCode = 422;
        throw error;
      }
    } else {
      const defaultTextFont = await textFontRepository.getDefault();
      if (defaultTextFont) {
        validatedTextFontName = defaultTextFont.id;
      }
    }

    // Validate playlists (if provided)
    if (playlist_ids.length > 0) {
      const playlistValidations = await Promise.all(
        playlist_ids.map(async (playlistId) => {
          const playlist = await playlistRepository.findById(playlistId);
          // Check if playlist exists, not deleted, and belongs to user or has no space
          if (!playlist || playlist.is_deleted) {
            return { valid: false, playlistId, reason: 'not found or deleted' };
          }
          // Playlist should either have no space_id or belong to the same user
          if (playlist.space_id && playlist.space?.user_id !== user_id) {
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
    }

    // Prepare space data
    const spaceData = {
      user_id,
      name,
      description: description || null,
      background_id: validatedBackgroundId,
      clock_font_id: validatedClockFontId,
      text_font_name: validatedTextFontName,
    };

    // Create space with all relations
    return await spaceRepository.create(
        spaceData,
        tags,
        playlist_ids,
        widget_positions
    );
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

    const { metadata, appearance, tags, playlist_links, widgets } = data;
    const spaceData = {};
    let tagIds = null;
    let playlistLinksAdd = [];
    let playlistLinksRemove = [];
    let widgetPositions = null;

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
      if (appearance.background_id !== undefined) {
        if (appearance.background_id) {
          const background = await backgroundRepository.findById(appearance.background_id);
          if (!background || background.is_deleted) {
            const error = new Error('Invalid background ID');
            error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
            error.statusCode = 422;
            throw error;
          }
        }
        spaceData.background_id = appearance.background_id;
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

      if (appearance.text_font_name !== undefined) {
        if (appearance.text_font_name) {
          const textFont = await textFontRepository.findById(appearance.text_font_name);
          if (!textFont || textFont.is_deleted) {
            const error = new Error('Invalid text font name');
            error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
            error.statusCode = 422;
            throw error;
          }
        }
        spaceData.text_font_name = appearance.text_font_name;
      }
    }

    // Process tags update
    if (tags !== undefined) {
      if (!tags || tags.length === 0) {
        const error = new Error('At least one tag is required');
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        throw error;
      }

      // Validate all tags
      const tagValidations = await Promise.all(
        tags.map(async (tagId) => {
          const tag = await tagRepository.findById(tagId);
          if (!tag || tag.is_deleted) {
            return { valid: false, tagId };
          }
          return { valid: true, tagId };
        })
      );

      const invalidTags = tagValidations.filter(t => !t.valid);
      if (invalidTags.length > 0) {
        const error = new Error(`Invalid or deleted tag IDs: ${invalidTags.map(t => t.tagId).join(', ')}`);
        error.code = ErrorCodes.SPACE_VALIDATION_FAILED;
        error.statusCode = 422;
        throw error;
      }

      tagIds = tags;
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

    // Process widgets
    if (widgets !== undefined) {
      widgetPositions = widgets;
    }

    // Perform update
    return await spaceRepository.update(
        id,
        spaceData,
        tagIds,
        playlistLinksAdd,
        playlistLinksRemove,
        widgetPositions
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
};

export default spaceService;

