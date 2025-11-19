import {CLOCK_FONTS_STYLE, EMOTION_KEYWORDS, MOOD_KEYWORDS, TAG_KEYWORDS, TEXT_FONTS} from '../constants/state.js';
import prisma from '../config/prisma.js';
import naverApiService from './naver-api.service.js';

/**
 * Calculate matching score between two arrays
 */
function calculateMatchScore(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;

  const matches = arr1.filter(item => arr2.includes(item));
  return matches.length;
}

/**
 * Find best matching background based on emotions and tags
 */
async function findBestBackground(emotions, tags) {
  // Validate inputs
  if (!Array.isArray(emotions)) {
    emotions = [];
  }
  if (!Array.isArray(tags)) {
    tags = [];
  }

  const backgrounds = await prisma.background.findMany({
    where: {
      is_deleted: false
    }
  });

  if (backgrounds.length === 0) {
    throw new Error('No backgrounds available in database. Please ensure backgrounds are seeded.');
  }

  // Calculate match scores
  const scored = backgrounds.map(bg => {
    const emotionScore = calculateMatchScore(emotions, bg.emotion);
    const tagScore = calculateMatchScore(tags, bg.tags);
    const totalScore = emotionScore + tagScore;

    return {
      background: bg,
      score: totalScore
    };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Get all with highest score
  const maxScore = scored[0].score;
  const topMatches = scored.filter(s => s.score === maxScore);

  // Random selection if multiple matches
  const selected = topMatches[Math.floor(Math.random() * topMatches.length)];

  return selected.background;
}

/**
 * Find best matching tracks based on emotions and tags
 */
async function findBestTracks(emotions, tags, limit = 5) {
  const tracks = await prisma.track.findMany({
    where: {
      is_deleted: false
    }
  });

  if (tracks.length === 0) {
    return [];
  }

  // Calculate match scores
  const scored = tracks.map(track => {
    const emotionScore = calculateMatchScore(emotions, track.emotion);
    const tagScore = calculateMatchScore(tags, track.tags);
    const totalScore = emotionScore + tagScore;

    return {
      track,
      score: totalScore
    };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Get top N tracks
  const topTracks = scored.slice(0, limit);

  // If multiple tracks have the same score, shuffle them
  const maxScore = topTracks[0]?.score || 0;
  const sameScoredTracks = scored.filter(s => s.score === maxScore);

  if (sameScoredTracks.length > limit) {
    // Shuffle and take limit
    const shuffled = sameScoredTracks.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit).map(s => s.track);
  }

  return topTracks.map(s => s.track);
}

/**
 * Generate a complete space based on user prompt
 */
export async function generateSpace(prompt) {
  // Prepare context for AI
  const context = {
    emotions: EMOTION_KEYWORDS,
    tags: TAG_KEYWORDS,
    textFonts: TEXT_FONTS,      // Array of font names
    clockFonts: CLOCK_FONTS_STYLE,  // Array of font styles
    moods: MOOD_KEYWORDS             // Array of mood keywords (emotions)
  };

  // Call Naver AI to generate space configuration
  const aiResponse = await naverApiService.generateSpaceFromPrompt(prompt, context);

  // Find matching background
  const background = await findBestBackground(aiResponse.emotions, aiResponse.tags);

  // Find matching tracks
  const tracks = await findBestTracks(aiResponse.emotions, aiResponse.tags, 5);

  // Get font IDs from database - ClockFont uses 'style' field
  const clockFont = await prisma.clockFont.findFirst({
    where: {
      style: aiResponse.clockFont,
      is_deleted: false
    }
  });

  // TextFont uses 'font_name' field
  const textFont = await prisma.textFont.findFirst({
    where: {
      font_name: aiResponse.textFont,
      is_deleted: false
    }
  });

  // Prepare final response
  return {
    name: aiResponse.name,
    description: aiResponse.description,
    clock_font: {
      id: clockFont?.id,
      style: aiResponse.clockFont
    },
    text_font: {
      id: textFont?.id,
      font_name: aiResponse.textFont
    },
    background: {
      id: background.id,
      url: background.background_url,
      emotion: background.emotion,
      tags: background.tags
    },
    playlist: {
      name: `${aiResponse.name} - Playlist`,
      tracks: tracks.map((track, index) => ({
        id: track.id,
        name: track.name,
        thumbnail: track.thumbnail,
        track_url: track.track_url,
        emotion: track.emotion,
        tags: track.tags,
        order: index + 1
      }))
    },
    prompt: prompt,
    tags: aiResponse.tags
  };
}

/**
 * Save generated space to database
 * @param {Object} spaceData - Space data object
 * @param {string} spaceData.userId - User ID
 * @param {string} spaceData.name - Space name
 * @param {string} spaceData.description - Space description
 * @param {string} spaceData.backgroundId - Background ID
 * @param {string} spaceData.clockFontId - Clock font ID
 * @param {string} spaceData.textFontId - Text font ID
 * @param {Array<string>} spaceData.tracks - Array of track IDs (optional)
 * @param {string} spaceData.prompt - AI prompt (optional)
 * @param {Array<string>} spaceData.tags - Array of tag names
 */
export async function saveGeneratedSpace(spaceData) {
  const {
    userId,
    name,
    description,
    backgroundId,
    clockFontId,
    textFontId,
    tracks,
    prompt,
    tags
  } = spaceData;

  // Validate that user exists
  const user = await prisma.user.findUnique({
    where: { id: userId, is_deleted: false }
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Validate that background exists
  if (backgroundId) {
    const background = await prisma.background.findUnique({
      where: { id: backgroundId, is_deleted: false }
    });

    if (!background) {
      throw new Error(`Background with ID ${backgroundId} not found`);
    }
  }

  // Validate that clock font exists
  if (clockFontId) {
    const clockFont = await prisma.clockFont.findUnique({
      where: { id: clockFontId, is_deleted: false }
    });

    if (!clockFont) {
      throw new Error(`Clock font with ID ${clockFontId} not found`);
    }
  }

  // Validate that text font exists
  if (textFontId) {
    const textFont = await prisma.textFont.findUnique({
      where: { id: textFontId, is_deleted: false }
    });

    if (!textFont) {
      throw new Error(`Text font with ID ${textFontId} not found`);
    }
  }

  // Validate tracks if provided
  if (tracks && Array.isArray(tracks) && tracks.length > 0) {
    const trackRecords = await prisma.track.findMany({
      where: {
        id: { in: tracks },
        is_deleted: false
      }
    });

    if (trackRecords.length !== tracks.length) {
      const foundIds = trackRecords.map(t => t.id);
      const missingIds = tracks.filter(id => !foundIds.includes(id));
      throw new Error(`Tracks not found: ${missingIds.join(', ')}`);
    }
  }

  // Create space
  const space = await prisma.space.create({
    data: {
      user_id: userId,
      name: name,
      description: description || null,
      background_id: backgroundId || null,
      clock_font_id: clockFontId || null,
      text_font_id: textFontId || null,
      is_deleted: false
    }
  });

  // Save AI generated content info if prompt exists
  if (prompt) {
    await prisma.aiGeneratedContent.create({
      data: {
        space_id: space.id,
        prompt: prompt,
        content: JSON.stringify(spaceData) // Store full config for reference
      }
    });
  }

  // Save tags
  if (tags && Array.isArray(tags) && tags.length > 0) {
    for (const tagName of tags) {
      // Find or create tag
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      });

      // Create SpaceTag
      await prisma.spaceTag.create({
        data: {
          space_id: space.id,
          tag_id: tag.id
        }
      });
    }
  }

  // Create playlist with tracks if provided
  if (tracks && Array.isArray(tracks) && tracks.length > 0) {
    const playlist = await prisma.playlist.create({
      data: {
        space_id: space.id,
        name: `${name} - Playlist`,
        is_deleted: false
      }
    });

    // Add tracks to playlist
    await prisma.playlistTrack.createMany({
      data: tracks.map((trackId, index) => ({
        playlist_id: playlist.id,
        track_id: trackId,
        track_order: index + 1,
        is_deleted: false
      }))
    });
  }

  // Return complete space with all relations
  return await prisma.space.findUnique({
    where: { id: space.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true
        }
      },
      background: {
        select: {
          id: true,
          background_url: true,
          emotion: true,
          tags: true,
          source: true
        }
      },
      clock: {
        select: {
          id: true,
          style: true
        }
      },
      text: {
        select: {
          id: true,
          font_name: true
        }
      },
      space_tags: {
        include: {
          tag: true
        }
      },
      playlists: {
        where: { is_deleted: false },
        include: {
          playlist_tracks: {
            where: { is_deleted: false },
            include: {
              track: true
            },
            orderBy: {
              track_order: 'asc'
            }
          }
        }
      },
      notes: {
        where: { is_delete: false },
        orderBy: { note_order: 'asc' }
      }
    }
  });
}

export default {
  generateSpace,
  saveGeneratedSpace
};
