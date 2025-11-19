import { EMOTION_KEYWORDS, TAG_KEYWORDS, TEXT_FONTS, CLOCK_FONTS } from '../constants/state.js';
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
    textFonts: TEXT_FONTS,
    clockFonts: CLOCK_FONTS
  };

  // Call Naver AI to generate space configuration
  const aiResponse = await naverApiService.generateSpaceFromPrompt(prompt, context);

  // Find matching background
  const background = await findBestBackground(aiResponse.emotions, aiResponse.tags);

  // Find matching tracks
  const tracks = await findBestTracks(aiResponse.emotions, aiResponse.tags, 5);

  // Get font IDs from database
  const clockFont = await prisma.clockFont.findFirst({
    where: {
      font_name: aiResponse.clockFont,
      is_deleted: false
    }
  });

  const textFont = await prisma.textFont.findFirst({
    where: {
      font_name: aiResponse.textFont,
      is_deleted: false
    }
  });

  // Prepare final response
  const generatedSpace = {
    name: aiResponse.name,
    description: aiResponse.description,
    clock_font: {
      id: clockFont?.id,
      name: aiResponse.clockFont
    },
    text_font: {
      id: textFont?.id,
      name: aiResponse.textFont
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

  return generatedSpace;
}

/**
 * Save generated space to database
 */
export async function saveGeneratedSpace(userId, generatedSpace) {
  // Create space
  const space = await prisma.space.create({
    data: {
      user_id: userId,
      name: generatedSpace.name,
      description: generatedSpace.description,
      background_id: generatedSpace.background.id,
      clock_font_id: generatedSpace.clock_font.id,
      text_font_id: generatedSpace.text_font.id,
      is_deleted: false
    }
  });

  // Save AI generated content info
  if (generatedSpace.prompt) {
    await prisma.aiGeneratedContent.create({
      data: {
        space_id: space.id,
        prompt: generatedSpace.prompt,
        content: JSON.stringify(generatedSpace) // Store full config for reference
      }
    });
  }

  // Save tags
  if (generatedSpace.tags && generatedSpace.tags.length > 0) {
    for (const tagName of generatedSpace.tags) {
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

  // Create playlist
  if (generatedSpace.playlist && generatedSpace.playlist.tracks.length > 0) {
    const playlist = await prisma.playlist.create({
      data: {
        space_id: space.id,
        name: generatedSpace.playlist.name,
        is_deleted: false
      }
    });

    // Add tracks to playlist
    await prisma.playlistTrack.createMany({
      data: generatedSpace.playlist.tracks.map(track => ({
        playlist_id: playlist.id,
        track_id: track.id,
        track_order: track.order,
        is_deleted: false
      }))
    });
  }

  // Return complete space with all relations
  return await prisma.space.findUnique({
    where: { id: space.id },
    include: {
      background: true,
      clock: true,
      text: true,
      space_tags: {
        include: {
          tag: true
        }
      },
      playlists: {
        include: {
          playlist_tracks: {
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
