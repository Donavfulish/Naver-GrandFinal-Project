import { NAVER_CLOVA_STUDIO_API_KEY, NAVER_CLOVA_STUDIO_API_URL } from '../config/env.js';
import logger from '../config/logger.js';
import { ErrorCodes } from '../constants/errorCodes.js';

/**
 * NAVER API Service
 * Handles interactions with NAVER Cloud Platform CLOVA Studio LLM API
 */
class NaverApiService {
  constructor() {
    // Validate API key on initialization
    if (!NAVER_CLOVA_STUDIO_API_KEY) {
      const error = new Error('NAVER_CLOVA_STUDIO_API_KEY is not configured. Please set it in environment variables.');
      logger.error(error.message);
      throw error;
    }

    this.apiKey = NAVER_CLOVA_STUDIO_API_KEY.trim();
    // Use v3 endpoint (confirmed working in Postman)
    // Override with NAVER_CLOVA_STUDIO_API_URL if needed, but default to v3
    this.apiUrl = NAVER_CLOVA_STUDIO_API_URL || 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007';
    this.model = 'HCX-007'; // HyperCLOVA X model
    this.maxRetries = 3;
    this.retryDelay = 1000; // Initial delay in milliseconds
    
    // Log the URL being used for debugging
    logger.info(`[NAVER API] Service initialized with URL: ${this.apiUrl}`);
  }


  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   * @param {number} statusCode - HTTP status code
   * @returns {boolean}
   */
  isRetryable(statusCode) {
    // Retry on network errors (no status), server errors (5xx), and rate limits (429)
    return !statusCode || statusCode >= 500 || statusCode === 429;
  }

  /**
   * Create error object with appropriate error code
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @returns {Error}
   */
  createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;

    if (statusCode === 401 || statusCode === 403) {
      error.code = ErrorCodes.NAVER_API_AUTH_FAILED;
    } else if (statusCode === 429) {
      error.code = ErrorCodes.NAVER_API_RATE_LIMIT;
    } else if (statusCode >= 400 && statusCode < 500) {
      error.code = ErrorCodes.NAVER_API_INVALID_REQUEST;
    } else if (statusCode >= 500 || !statusCode) {
      error.code = statusCode ? ErrorCodes.NAVER_API_ERROR : ErrorCodes.NAVER_API_TIMEOUT;
    } else {
      error.code = ErrorCodes.NAVER_API_ERROR;
    }

    return error;
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @param {number} attempt - Current attempt number
   * @returns {Promise<Response>}
   */
  async makeRequestWithRetry(url, options, attempt = 1) {
    const startTime = Date.now();

    try {
      logger.info(`[NAVER API] Request attempt ${attempt}: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-NCP-CLOVASTUDIO-REQUEST-ID': `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...options.headers,
        },
      });

      const duration = Date.now() - startTime;
      const requestId = options.headers?.['X-NCP-CLOVASTUDIO-REQUEST-ID'] || 'unknown';

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

        logger.error(`[NAVER API] Request failed: ${response.status} ${response.statusText}`, {
          url,
          statusCode: response.status,
          errorData,
          requestId,
          duration,
        });

        // Check if we should retry
        if (this.isRetryable(response.status) && attempt < this.maxRetries) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter
            ? parseInt(retryAfter) * 1000
            : this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff

          logger.info(`[NAVER API] Retrying after ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
          await this.sleep(delay);

          return this.makeRequestWithRetry(url, options, attempt + 1);
        }

        throw this.createError(
          errorData.message || `NAVER API request failed: ${response.statusText}`,
          response.status
        );
      }

      logger.info(`[NAVER API] Request successful`, {
        url,
        statusCode: response.status,
        requestId,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle network errors (no status code)
      if (!error.statusCode && attempt < this.maxRetries) {
        logger.warn(`[NAVER API] Network error, retrying (attempt ${attempt + 1}/${this.maxRetries})`, {
          url,
          error: error.message,
          duration,
        });

        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);

        return this.makeRequestWithRetry(url, options, attempt + 1);
      }

      logger.error(`[NAVER API] Request failed after ${attempt} attempt(s)`, {
        url,
        error: error.message,
        statusCode: error.statusCode,
        duration,
      });

      throw error;
    }
  }

  /**
   * Generate chat completion using NAVER CLOVA Studio LLM API
   * @param {Array<Object>} messages - Array of message objects with role and content
   * @param {Object} options - Optional configuration
   * @param {string} options.thinkingEffort - Reasoning effort level: 'none', 'low', 'medium', 'high' (default: 'none' for minimum price)
   * @param {number} options.temperature - Temperature for token diversity (0.00-1.00, default: 0.5)
   * @param {number} options.maxTokens - Maximum tokens to generate (default: 512)
   * @param {number} options.maxCompletionTokens - Maximum completion tokens for inference models (default: 512)
   * @param {number} options.topP - Cumulative probability for token sampling (0.00-1.00, default: 0.8)
   * @param {number} options.topK - Number of top candidates to sample (0-128, default: 0)
   * @param {number} options.repetitionPenalty - Penalty for repeated tokens (0-2.0, default: 1.1)
   * @param {Array<string>} options.stop - Stop sequences to abort generation
   * @param {boolean} options.includeAiFilters - Whether to include AI filter results (default: false)
   * @returns {Promise<string>} Generated text content
   */
  async chatCompletion(messages, options = {}) {
    const {
      thinkingEffort = 'none', // Default to 'none' for minimum price
      temperature = 0.5,
      maxTokens,
      maxCompletionTokens = 512,
      topP = 0.8,
      topK = 0,
      repetitionPenalty = 1.1,
      stop = [],
      includeAiFilters = false,
    } = options;

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw this.createError('Messages array is required and cannot be empty', 400);
    }

    // Validate message structure
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        throw this.createError('Each message must have "role" and "content" properties', 400);
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        throw this.createError('Message role must be "system", "user", or "assistant"', 400);
      }
    }

    // Validate thinking effort
    const validThinkingEfforts = ['none', 'low', 'medium', 'high'];
    if (!validThinkingEfforts.includes(thinkingEffort)) {
      throw this.createError(
        `Invalid thinkingEffort. Must be one of: ${validThinkingEfforts.join(', ')}`,
        400
      );
    }

    const url = this.apiUrl;

    // Build request body
    const requestBody = {
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      topP,
      temperature,
      repeatPenalty: repetitionPenalty,
      includeAiFilters,
    };

    // NOTE: topK is not always supported in v3 for some models/versions. 
    // If topK is 0, we should generally omit it unless we are sure the model supports it.
    // For stability, let's conditionally add it.
    if (topK > 0) {
      requestBody.topK = topK;
    }

    if (stop && stop.length > 0) {
      requestBody.stop = stop;
    }

    // Add thinking configuration if not 'none'
    if (thinkingEffort !== 'none') {
      requestBody.thinking = {
        effort: thinkingEffort,
      };
      requestBody.maxCompletionTokens = maxCompletionTokens;
    } else {
      // For HCX-007, use maxCompletionTokens even without thinking mode
      // maxTokens is not supported by this model
      if (maxTokens || maxCompletionTokens) {
        requestBody.maxCompletionTokens = maxTokens || maxCompletionTokens;
      }
    }

    const startTime = Date.now();

    try {
      const requestBodyJson = JSON.stringify(requestBody);
      logger.info(`[NAVER API] Chat completion request`, {
        url,
        model: this.model,
        thinkingEffort,
        messageCount: messages.length,
        requestBodyJson, // Log the exact JSON string being sent
        apiKeyPrefix: this.apiKey.substring(0, 10) + '...' // Log masked API key for verification
      });

      const response = await this.makeRequestWithRetry(url, {
        method: 'POST',
        body: requestBodyJson,
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      // Extract generated content
      // NAVER API v3 response structure: data.result.message.content
      const generatedContent = data.result?.message?.content ||
        data.result?.content ||
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.content ||
        data.content ||
        '';

      // Extract token usage (NAVER API v3: data.result.usage.totalTokens)
      const tokensUsed = data.result?.usage?.totalTokens ||
        data.usage?.totalTokens ||
        'unknown';

      logger.info(`[NAVER API] Chat completion successful`, {
        model: this.model,
        duration,
        tokensUsed,
        responseStructure: {
          hasResult: !!data.result,
          hasResultMessage: !!data.result?.message,
          hasChoices: !!data.choices,
          hasContent: !!data.content,
          generatedContentLength: generatedContent.length
        },
        generatedContentPreview: generatedContent.substring(0, 200) // Log first 200 chars
      });

      return generatedContent; // Return the text content, not the response object
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`[NAVER API] Chat completion failed`, {
        model: this.model,
        error: error.message,
        statusCode: error.statusCode,
        duration,
      });
      throw error;
    }
  }

  /**
   * Generate space configuration from user prompt using NAVER CLOVA Studio
   * @param {string} prompt - User's prompt describing the desired space
   * @param {Object} context - Context containing available options
   * @param {Array<string>} context.emotions - Available emotion keywords
   * @param {Array<string>} context.tags - Available tag keywords
   * @param {Array<string>} context.textFonts - Available text font names
   * @param {Array<string>} context.clockFonts - Available clock font styles
   * @param {Array<string>} context.moods - Available mood keywords
   * @returns {Promise<Object>} AI generated space configuration
   * @returns {string} return.name - Generated space name
   * @returns {string} return.description - Generated space description
   * @returns {string} return.clockFont - Selected clock font style
   * @returns {string} return.textFont - Selected text font name
   * @returns {Array<string>} return.emotions - Selected emotions (2-4 items)
   * @returns {Array<string>} return.tags - Selected tags (3-6 items)
   */
  async generateSpaceFromPrompt(prompt, context) {
    // TODO: Implement AI-based space generation
    // This method should:
    // 1. Construct a system prompt with context (emotions, tags, fonts)
    // 2. Call chatCompletion with user's prompt
    // 3. Parse AI response to extract: name, description, clockFont, textFont, emotions, tags
    // 4. Validate and return structured response

    // Temporary implementation - will be replaced with actual AI logic
    const messages = [
      {
  role: "system",
  content: `
You generate a JSON config for a user's “space” based on their prompt.
Follow these strict rules:

1. Detect user language → output only in that language.
2. Select:
   - 2–4 emotions from: ${context.emotions.join(', ')}
   - 3–6 tags from: ${context.tags.join(', ')}
   - 1 mood from: ${context.moods.join(', ')}
   - 1 textFont from: ${context.textFonts.join(', ')}
   - 1 clockFont from: ${context.clockFonts.join(', ')}
3. Choose exactly ONE quote from each list below and translate it to the user’s language:

Page1:
${context.introPage1.map(i => `- "${i.text}"`).join('\n')}

Page2:
${context.introPage2.map(i => `- "${i.text}"`).join('\n')}

Page3:
${context.introPage3.map(i => `- "${i.text}"`).join('\n')}

4. Output JSON ONLY in this format:

{
  "name": "",
  "description": "",
  "mood": "",
  "clockFont": "",
  "textFont": "",
  "emotions": [],
  "tags": [],
  "personalityEssence": {},
  "introPage1": "",
  "introPage2": "",
  "introPage3": ""
}`
  },
  {
    role: 'user',
    content: prompt
  }
];

    const response = await this.chatCompletion(messages, {
      temperature: 0.7
    });

    // Parse JSON response
    try {
      // Remove markdown code blocks if present (e.g., ```json ... ```)
      let cleanedResponse = response.trim();

      // Remove markdown code block markers
      if (cleanedResponse.startsWith('```')) {
        // Find the first newline after ```
        const firstNewline = cleanedResponse.indexOf('\n');
        if (firstNewline !== -1) {
          cleanedResponse = cleanedResponse.substring(firstNewline + 1);
        }
        // Remove trailing ```
        cleanedResponse = cleanedResponse.replace(/```\s*$/, '').trim();
      }

      const parsed = JSON.parse(cleanedResponse);

      // Validate parsed response structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Parsed response is not an object');
      }

      // Validate required fields
      if (!parsed.name || !parsed.description) {
        logger.warn('[NAVER API] Parsed response missing required fields', { parsed });
      }

      // Validate emotions and tags are arrays
      if (!Array.isArray(parsed.emotions)) {
        logger.warn('[NAVER API] Parsed response emotions is not an array', { emotions: parsed.emotions });
        parsed.emotions = [];
      }
      if (!Array.isArray(parsed.tags)) {
        logger.warn('[NAVER API] Parsed response tags is not an array', { tags: parsed.tags });
        parsed.tags = [];
      }

      // Add default values for intro pages if missing
      if (!parsed.introPage1) {
        logger.warn('[NAVER API] introPage1 missing in AI response');
        parsed.introPage1 = context.introPage1[0]?.text || '';
      }
      if (!parsed.introPage2) {
        logger.warn('[NAVER API] introPage2 missing in AI response');
        parsed.introPage2 = context.introPage2[0]?.text || '';
      }
      if (!parsed.introPage3) {
        logger.warn('[NAVER API] introPage3 missing in AI response');
        parsed.introPage3 = context.introPage3[0]?.text || '';
      }

      logger.info('[NAVER API] Successfully parsed AI response', {
        parsed: {
          name: parsed.name,
          description: parsed.description?.substring(0, 100),
          emotionsCount: parsed.emotions?.length,
          tagsCount: parsed.tags?.length,
          clockFont: parsed.clockFont,
          textFont: parsed.textFont,
          hasIntroPage1: !!parsed.introPage1,
          hasIntroPage2: !!parsed.introPage2,
          hasIntroPage3: !!parsed.introPage3
        }
      });
      return parsed;
    } catch (error) {
      logger.error('[NAVER API] Failed to parse AI response', {
        error: error.message,
        responseLength: response.length,
        responsePreview: response.substring(0, 500) // Log first 500 chars for debugging
      });
      // Fallback to mock response with intro pages
      return {
        name: `AI Generated Space`,
        description: `Space created based on: ${prompt.substring(0, 100)}`,
        clockFont: context.clockFonts[0],
        textFont: context.textFonts[0],
        emotions: ['calm', 'peaceful'],
        tags: ['ambient', 'relax', 'focus'],
        mood: 'Neutral',
        personalityEssence: {},
        introPage1: context.introPage1[0]?.text || '',
        introPage2: context.introPage2[0]?.text || '',
        introPage3: context.introPage3[0]?.text || ''
      };
    }
  }

  /**
   * Generate checkout reflection for a space session
   * @param {Object} checkoutData - Checkout data
   * @param {string} checkoutData.name - Space name
   * @param {string} checkoutData.description - Space description
   * @param {string} checkoutData.mood - Current mood
   * @param {number} checkoutData.duration - Duration in seconds
   * @param {string} checkoutData.notes - Combined notes content
   * @param {string|null} checkoutData.originalPrompt - Original AI prompt (null if user created manually)
   * @returns {Promise<Object>} Reflection with content field
   */
  async generateCheckoutReflection(checkoutData) {
    const { name, description, mood, duration, notes, originalPrompt } = checkoutData;

    // Convert duration to readable format
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const durationText = hours > 0
      ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
      : `${minutes} minute${minutes !== 1 ? 's' : ''}`;

    // Detect language from originalPrompt or description
    const languageSource = originalPrompt || description || '';

    const systemPrompt = `You are an empathetic AI assistant specialized in providing thoughtful reflections and life advice.

LANGUAGE REQUIREMENT:
- Detect the user's language from their original prompt or description.
- ALL output MUST be in the SAME LANGUAGE as the user's input (originalPrompt if available, otherwise description).
- If the language is Vietnamese, respond in Vietnamese.
- If the language is English, respond in English.
- Match the language naturally and fluently.

TASK: Analyze the user's space session and provide a meaningful reflection as a single cohesive text that includes:
1. A brief overview of their session (1-2 sentences)
2. A relevant quote from a famous person that relates to their experience
3. Practical advice or encouragement (2-3 sentences)

IMPORTANT:
- Be empathetic and understanding
- Match the tone to their mood and experience
- Provide actionable and specific advice
- Choose quotes that are genuinely relevant and inspiring
- Write the reflection as flowing, natural text (not separate fields)
- Format the quote naturally within the text with proper quotation marks
- RESPOND IN THE SAME LANGUAGE AS THE USER'S INPUT

OUTPUT FORMAT (JSON Only):
{
  "content": "Your complete reflection text here, including overview, quote, and advice in a natural flowing format, IN THE USER'S LANGUAGE"
}`;

    let userPrompt = `LANGUAGE DETECTION SOURCE: "${languageSource}"

SPACE SESSION DATA:
- Space Name: "${name}"
- Description: "${description || 'No description provided'}"
- Current Mood: ${mood}
- Session Duration: ${durationText}
- Notes Written: 
${notes || 'No notes were written during this session'}`;

    // Only include original prompt if it exists (space was created by AI, not manually)
    if (originalPrompt) {
      userPrompt += `\n- Original Intent: "${originalPrompt}"`;
      userPrompt += `\n\nIMPORTANT: Respond in the SAME LANGUAGE as the "Original Intent" text above.`;
    } else {
      userPrompt += `\n\nIMPORTANT: This space was created manually. Respond in the SAME LANGUAGE as the "Description" text above.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.7, // Medium temperature for creative but relevant responses
      topP: 0.9,
      thinkingEffort: 'low'
    });

    try {
      let cleanedResponse = response.trim();

      // Log raw response for debugging
      logger.info('[NAVER API] Raw checkout reflection response', {
        responseLength: response.length,
        responsePreview: response.substring(0, 500)
      });

      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith('```')) {
        const firstNewline = cleanedResponse.indexOf('\n');
        if (firstNewline !== -1) {
          cleanedResponse = cleanedResponse.substring(firstNewline + 1);
        }
        cleanedResponse = cleanedResponse.replace(/```\s*$/, '').trim();
        cleanedResponse = cleanedResponse.replace(/^json\s*/i, '').trim();
      }

      // Try to extract JSON if there's extra text before/after
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedResponse);

      // Basic validation
      if (!parsed.content || typeof parsed.content !== 'string') {
        logger.warn('[NAVER API] Checkout reflection response missing or invalid content field', { parsed });
        throw new Error('Invalid checkout reflection response structure');
      }

      logger.info('[NAVER API] Generated Checkout Reflection', {
        contentLength: parsed.content?.length
      });

      return parsed; // { content: "..." }

    } catch (error) {
      logger.error('[NAVER API] Failed to parse checkout reflection response', {
        error: error.message,
        errorStack: error.stack,
        responseLength: response.length,
        responsePreview: response.substring(0, 1000)
      });

      // Fallback based on mood
      if (['Stressed', 'Sad', 'Anxious', 'Angry'].includes(mood)) {
        return {
          content: "You've spent time with your thoughts during a challenging moment.\n\n\"The greatest glory in living lies not in never falling, but in rising every time we fall.\" - Nelson Mandela\n\nIt's okay to feel this way. Take small steps: breathe deeply, reach out to someone you trust, or engage in an activity that brings you comfort. Tomorrow is a new opportunity."
        };
      } else if (['Happy', 'Excited', 'Proud', 'Grateful'].includes(mood)) {
        return {
          content: "You've had a productive and uplifting session.\n\n\"Happiness is not by chance, but by choice.\" - Jim Rohn\n\nCelebrate this moment! Take note of what made you feel this way and try to incorporate more of it into your routine. Share your positivity with others."
        };
      } else {
        return {
          content: "You've taken time to focus and reflect.\n\n\"The present moment is the only time over which we have dominion.\" - Thích Nhất Hạnh\n\nContinue being present and mindful. Regular reflection helps you understand yourself better and make conscious choices moving forward."
        };
      }
    }
  }

  /**
   * Generate user mind description based on their recent spaces
   * @param {Object} data - Mind generation data
   * @param {Object} data.payload - Aggregated user data
   * @param {string} data.payload.compactPersonality - Aggregated mood percentages
   * @param {Array<string>} data.payload.topTags - Most frequent tags
   * @param {Array<string>} data.payload.samplePrompts - Sample prompts from spaces
   * @param {Array<string>} data.payload.sampleContents - Sample content snippets
   * @param {Object} data.payload.personalityEssenceScores - User's personality essence scores (e.g., {soft: 7.5, calm: 8.0})
   * @param {Array<string>} data.payload.availableEssenceKeys - Available essence keys
   * @param {Object} data.payload.personalityEssenceData - Full PERSONALITY_ESSENCE object with Vietnamese words
   * @param {string} data.seed - Fallback seed sentence
   * @returns {Promise<string>} - Poetic sentence describing user's mind in same language as their prompts
   */
  async generateUserMind(data) {
    const { payload, seed } = data;
    const {
      compactPersonality,
      topTags,
      samplePrompts,
      sampleContents,
      personalityEssenceScores,
      availableEssenceKeys,
      personalityEssenceData
    } = payload;

    // Detect language from sample prompts
    const languageSource = samplePrompts && samplePrompts.length > 0
      ? samplePrompts.join(' ')
      : (sampleContents && sampleContents.length > 0 ? sampleContents.join(' ') : '');

    // Format personality essence data for AI prompt
    const essenceKeysDescription = availableEssenceKeys
      .map(key => {
        const words = personalityEssenceData[key] || [];
        return `  - ${key}: [${words.join(', ')}]`;
      })
      .join('\n');

    // Format user's existing essence scores if available
    const userEssenceScoresText = personalityEssenceScores && Object.keys(personalityEssenceScores).length > 0
      ? `\n- User's Personality Essence Scores (from previous spaces):\n${Object.entries(personalityEssenceScores)
          .sort((a, b) => b[1] - a[1])
          .map(([key, score]) => `  * ${key}: ${score}/10`)
          .join('\n')}`
      : '';

    const systemPrompt = `You are a poetic AI assistant specialized in crafting beautiful, concise sentences that capture a person's essence.

CRITICAL - LANGUAGE DETECTION:
- You MUST detect the user's language from their sample prompts/content
- Generate the output in THE SAME LANGUAGE as the user's prompts
- If prompts are in Vietnamese → Output in Vietnamese
- If prompts are in English → Output in English
- If prompts are in other languages → Match that language
- The language detection source will be provided in the user prompt

TASK: Generate a single, poetic sentence that describes the user's "mind" (mental/emotional state) based on their recent creative spaces and personality.

IMPORTANT - PERSONALITY ESSENCE SELECTION:
You have access to a personality essence system with Vietnamese words. Your task is to:
1. Analyze the user's emotional profile, tags, and content
2. Select 2-4 most appropriate essence keys from the available list below
3. From each selected key, pick 1-2 representative words
4. Use ONLY these selected words to craft the poetic sentence
5. If output language is NOT Vietnamese, translate the selected words appropriately

AVAILABLE PERSONALITY ESSENCE KEYS AND WORDS (Vietnamese):
${essenceKeysDescription}

REQUIREMENTS:
1. Output MUST be a single sentence (one sentence only) in the USER'S LANGUAGE
2. Maximum 20-25 words, poetic and lyrical in style
3. Use words from the personality essence keys you selected (translate if needed)
4. Choose essence keys that best match the user's mood, tags, and overall personality
5. Sound natural, poetic, and meaningful in the target language
6. Do NOT use JSON format - return ONLY the plain text sentence
7. The sentence should feel personal and insightful

STYLE EXAMPLES:

Vietnamese:
- "Bạn làm từ ánh sáng buổi sớm, yên tĩnh như làn gió qua rừng, mang trong mình sự bình yên của những ngày mưa."
- "Tâm hồn bạn dệt từ gió nhẹ, hoa hồng và ánh trăng, êm dịu như tiếng piano trong đêm tĩnh lặng."
- "Bạn là sự hòa quyện của cà phê đắng, sách và ánh nắng, tập trung như những dòng suy nghĩ sâu thẳm."

English:
- "You are made of morning light, quiet as the wind through the forest, carrying within the peace of rainy days."
- "Your soul is woven from gentle breezes, roses and moonlight, soft as piano notes in the silent night."
- "You are the harmony of bitter coffee, books and sunlight, focused as the depths of thought."

OUTPUT FORMAT: Just the sentence in the user's language - NO JSON, NO quotes, NO extra text`;

    let userPrompt = `LANGUAGE DETECTION SOURCE: "${languageSource}"

IMPORTANT: Detect the language from the source above and generate your output in THE SAME LANGUAGE.

USER PERSONALITY DATA:
- Emotional Profile: ${compactPersonality}
- Top Tags (most frequent): ${topTags.join(', ') || 'None'}${userEssenceScoresText}`;

    if (samplePrompts && samplePrompts.length > 0) {
      userPrompt += `\n- Sample Space Prompts (USE THIS TO DETECT LANGUAGE):\n${samplePrompts.map((p, i) => `  ${i + 1}. "${p}"`).join('\n')}`;
    }

    if (sampleContents && sampleContents.length > 0) {
      userPrompt += `\n- Sample Content Snippets:\n${sampleContents.map((c, i) => `  ${i + 1}. "${c}..."`).join('\n')}`;
    }

    userPrompt += `\n\nBased on this data:
1. First, DETECT THE LANGUAGE from the sample prompts above
2. Select 2-4 personality essence keys that best represent this person
3. From each key, pick 1-2 words (Vietnamese from the list, but translate them if needed)
4. Craft ONE poetic sentence using those words IN THE DETECTED LANGUAGE

CRITICAL: Your output MUST be in the same language as the sample prompts above!`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.chatCompletion(messages, {
        temperature: 0.9, // Higher temperature for more creative/poetic output
        topP: 0.95,
        thinkingEffort: 'medium'
      });

      let mindSentence = response.trim();

      // Log raw response for debugging
      logger.info('[NAVER API] Raw mind generation response', {
        responseLength: mindSentence.length,
        response: mindSentence,
        languageSource: languageSource.substring(0, 100)
      });

      // Clean up any unwanted formatting
      // Remove quotes if AI wrapped the sentence in quotes
      if ((mindSentence.startsWith('"') && mindSentence.endsWith('"')) ||
          (mindSentence.startsWith("'") && mindSentence.endsWith("'"))) {
        mindSentence = mindSentence.slice(1, -1);
      }

      // Remove any JSON-like wrapping if present
      if (mindSentence.includes('{') || mindSentence.includes('}')) {
        const jsonMatch = mindSentence.match(/"mind":\s*"([^"]+)"/);
        if (jsonMatch) {
          mindSentence = jsonMatch[1];
        } else {
          const contentMatch = mindSentence.match(/"content":\s*"([^"]+)"/);
          if (contentMatch) {
            mindSentence = contentMatch[1];
          }
        }
      }

      // Clean up any remaining artifacts
      mindSentence = mindSentence
        .replace(/^(Output|Result|Response):\s*/i, '')
        .replace(/```/g, '')
        .trim();

      // Validate the result
      if (!mindSentence || mindSentence.length < 10 || mindSentence.length > 300) {
        logger.warn('[NAVER API] Generated mind sentence is invalid (too short/long), using seed', {
          length: mindSentence?.length,
          sentence: mindSentence
        });
        return seed;
      }

      logger.info('[NAVER API] Successfully generated user mind', {
        mind: mindSentence,
        length: mindSentence.length
      });

      return mindSentence;

    } catch (error) {
      logger.error('[NAVER API] Failed to generate user mind', {
        error: error.message,
        errorStack: error.stack,
        seed
      });

      // Return seed as fallback
      return seed;
    }
  }

}

export default new NaverApiService();
