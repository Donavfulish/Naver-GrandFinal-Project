import { PERSONALITY_ESSENCE, CLOCK_FONTS_STYLE, EMOTION_KEYWORDS, MOOD_KEYWORDS, TAG_KEYWORDS, TEXT_FONTS } from '../constants/state.js';
import { INTRO_PAGE3, INTRO_PAGE1, INTRO_PAGE2 } from '../constants/introPage.js';
import prisma from '../config/prisma.js';
import naverApiService from './naver-api.service.js';
import logger from '../config/logger.js';

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
    moods: MOOD_KEYWORDS,
    introPage1: INTRO_PAGE1,
    introPage2: INTRO_PAGE2,
    introPage3: INTRO_PAGE3
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
    mood: aiResponse.mood || 'Neutral',
    personalityEssence: aiResponse.personalityEssence || {},
    introPage1: aiResponse.introPage1 || '',
    introPage2: aiResponse.introPage2 || '',
    introPage3: aiResponse.introPage3 || '',
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
 * Generate checkout reflection for a space (Act 3)
 * @param {string} spaceId - Space ID
 */
export async function checkout(spaceId) {
  // Fetch space with all necessary data
  const space = await prisma.space.findUnique({
    where: { id: spaceId, is_deleted: false },
    select: {
      name: true,
      description: true,
      mood: true,
      duration: true,
      notes: {
        where: { is_deleted: false },
        orderBy: { note_order: 'asc' },
        select: { content: true }
      },
      AiGeneratedContent: {
        select: {
          id: true,
          prompt: true
        }
      }
    }
  });

  if (!space) {
    throw new Error('Space not found');
  }

  // Get mood from space
  const effectiveMood = space.mood || 'Neutral';

  // Edge case: Zero notes -> Smart Fallback
  if (!space.notes || space.notes.length === 0) {
    let fallbackContent = '';

    // If mood is negative (Stressed, Sad), use a gentle question
    if (['Stressed', 'Sad', 'Anxious', 'Angry'].includes(effectiveMood)) {
      fallbackContent = "You've spent time with your thoughts during a challenging moment.\n\n\"The greatest glory in living lies not in never falling, but in rising every time we fall.\" - Nelson Mandela\n\nIt's okay to feel this way. Take small steps: breathe deeply, reach out to someone you trust, or engage in an activity that brings you comfort. Tomorrow is a new opportunity.";
    }
    // If mood is positive (Happy, Excited), use a savoring question
    else if (['Happy', 'Excited', 'Proud', 'Grateful'].includes(effectiveMood)) {
      fallbackContent = "You've had a productive and uplifting session.\n\n\"Happiness is not by chance, but by choice.\" - Jim Rohn\n\nCelebrate this moment! Take note of what made you feel this way and try to incorporate more of it into your routine. Share your positivity with others.";
    }
    // Default/Neutral Fallback (Mindfulness)
    else {
      fallbackContent = "You've taken time to focus and reflect.\n\n\"The present moment is the only time over which we have dominion.\" - Thích Nhất Hạnh\n\nContinue being present and mindful. Regular reflection helps you understand yourself better and make conscious choices moving forward.";
    }

    // Save content to ai_generated_contents
    if (space.AiGeneratedContent?.id) {
      await prisma.aiGeneratedContent.update({
        where: { id: space.AiGeneratedContent.id },
        data: {
          content: fallbackContent,
          updated_at: new Date()
        }
      });
    } else {
      await prisma.aiGeneratedContent.create({
        data: {
          space_id: spaceId,
          prompt: null,
          content: fallbackContent
        }
      });
    }

    return { content: fallbackContent };
  }

  // Combine notes content
  const notesContent = space.notes.map(n => n.content).join('\n');

  // Prepare data for AI
  const checkoutData = {
    name: space.name,
    description: space.description,
    mood: effectiveMood,
    duration: space.duration,
    notes: notesContent,
    originalPrompt: space.AiGeneratedContent?.prompt || null // null if user created manually
  };

  // Call Naver API to generate reflection
  const reflection = await naverApiService.generateCheckoutReflection(checkoutData);
  // reflection = { content: "..." } from AI

  // Save content string to ai_generated_contents table
  if (space.AiGeneratedContent?.id) {
    // Update existing record
    await prisma.aiGeneratedContent.update({
      where: { id: space.AiGeneratedContent.id },
      data: {
        content: reflection.content,
        updated_at: new Date()
      }
    });
  } else {
    // Create new record
    await prisma.aiGeneratedContent.create({
      data: {
        space_id: spaceId,
        prompt: null, // User created manually, no original prompt
        content: reflection.content
      }
    });
  }

  // Return same format as AI returned: { content: "..." }
  return reflection;
}

/**
 * Generate user mind description based on their 10 most recent spaces
 * @param {string} userId - User ID
 * @returns {Promise<{mind: string}>} - Generated mind description
 */
export async function generateUserMind(userId) {
  // Fetch user's 10 most recent spaces with related data
  const recentSpaces = await prisma.space.findMany({
    where: {
      user_id: userId,
      is_deleted: false
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 5,
    select: {
      id: true,
      name: true,
      description: true,
      mood: true,
      personalityEssence: true,
      created_at: true,
      notes: {
        where: { is_deleted: false },
        select: { content: true }
      },
      space_tags: {
        where: { is_deleted: false },
        select: {
          tag: {
            select: {
              name: true
            }
          }
        }
      },
      AiGeneratedContent: {
        select: {
          prompt: true,
          content: true
        }
      }
    }
  });

  // If user has no spaces, return a neutral fallback
  if (!recentSpaces || recentSpaces.length === 0) {
    const fallbackMind = "Bạn là người mới bắt đầu hành trình khám phá bản thân.";

    // Save to user.mind
    await prisma.user.update({
      where: { id: userId },
      data: { mind: fallbackMind }
    });

    logger.info(`[generateUserMind] No spaces found for user ${userId}, using fallback`);
    return { mind: fallbackMind };
  }

  // Aggregate data from spaces
  const moodCounts = {};
  const allTags = [];
  const allPrompts = [];
  const allContents = [];
  const allPersonalityEssences = [];

  recentSpaces.forEach(space => {
    // Count moods
    if (space.mood) {
      moodCounts[space.mood] = (moodCounts[space.mood] || 0) + 1;
    }

    // Collect tags from space_tags relation
    if (space.space_tags && Array.isArray(space.space_tags)) {
      space.space_tags.forEach(st => {
        if (st.tag?.name) {
          allTags.push(st.tag.name);
        }
      });
    }

    // Collect personality essences
    if (space.personalityEssence && typeof space.personalityEssence === 'object') {
      allPersonalityEssences.push(space.personalityEssence);
    }

    // Collect prompts
    if (space.AiGeneratedContent?.prompt) {
      allPrompts.push(space.AiGeneratedContent.prompt);
    }

    // Collect content snippets (first 100 chars of notes or AI content)
    if (space.notes && space.notes.length > 0) {
      const noteText = space.notes.map(n => n.content).join(' ').substring(0, 100);
      if (noteText.trim()) {
        allContents.push(noteText);
      }
    } else if (space.AiGeneratedContent?.content) {
      allContents.push(space.AiGeneratedContent.content.substring(0, 100));
    }
  });

  // Compute compact personality (aggregated moods)
  const totalMoods = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
  const compactPersonality = Object.entries(moodCounts)
    .map(([mood, count]) => `${mood} (${Math.round((count / totalMoods) * 100)}%)`)
    .join(', ');

  // Get top tags (most frequent)
  const tagFrequency = {};
  allTags.forEach(tag => {
    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
  });
  const topTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  // Aggregate personality essences (combine scores from all spaces)
  const aggregatedEssence = {};
  allPersonalityEssences.forEach(essence => {
    Object.entries(essence).forEach(([key, score]) => {
      if (!aggregatedEssence[key]) {
        aggregatedEssence[key] = [];
      }
      aggregatedEssence[key].push(score);
    });
  });

  // Calculate average scores for each essence key
  const averageEssenceScores = {};
  Object.entries(aggregatedEssence).forEach(([key, scores]) => {
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    averageEssenceScores[key] = Math.round(avg * 10) / 10; // Round to 1 decimal
  });

  // Sample prompts (up to 3)
  const samplePrompts = allPrompts.slice(0, 3);

  // Sample contents (up to 3)
  const sampleContents = allContents.slice(0, 3);

  // Get available personality essence keys
  const availableEssenceKeys = Object.keys(PERSONALITY_ESSENCE);

  // Build seed fallback with default essence words
  const defaultEssenceWords = ['ánh sáng', 'yên tĩnh', 'hòa bình', 'tự do'];
  const seed = `Bạn làm từ ${defaultEssenceWords.join(', ')}.`;

  // Prepare payload for Naver AI
  const payload = {
    compactPersonality: compactPersonality || 'Mixed emotions',
    topTags,
    samplePrompts,
    sampleContents,
    personalityEssenceScores: averageEssenceScores,
    availableEssenceKeys,
    personalityEssenceData: PERSONALITY_ESSENCE
  };

  logger.info(`[generateUserMind] Processing user ${userId}`, {
    spacesCount: recentSpaces.length,
    compactPersonality,
    topTags,
    personalityEssenceScores: averageEssenceScores,
    seed
  });

  let mindSentence;

  try {
    // Call Naver AI service to generate mind description
    const aiResponse = await naverApiService.generateUserMind({
      payload,
      seed
    });

    // Validate AI response
    if (aiResponse && typeof aiResponse === 'string' && aiResponse.trim().length > 10) {
      mindSentence = aiResponse.trim();
      logger.info(`[generateUserMind] AI generated mind for user ${userId}: "${mindSentence}"`);
    } else {
      // AI returned empty or too short - use seed fallback
      mindSentence = seed;
      logger.warn(`[generateUserMind] AI returned invalid response for user ${userId}, using seed fallback: "${mindSentence}"`);
    }
  } catch (error) {
    // AI service error - use seed fallback
    mindSentence = seed;
    logger.error(`[generateUserMind] AI service error for user ${userId}, using seed fallback`, {
      error: error.message,
      seed: mindSentence
    });
  }

  // Save mind to user record
  await prisma.user.update({
    where: { id: userId },
    data: {
      mind: mindSentence,
      updated_at: new Date()
    }
  });

  logger.info(`[generateUserMind] Saved mind for user ${userId}: "${mindSentence}"`);

  return { mind: mindSentence };
}

export default {
  generateSpace,
  checkout,
  generateUserMind
};
