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
      repetitionPenalty,
      includeAiFilters,
    };

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
      // Use maxTokens for non-thinking mode
      if (maxTokens) {
        requestBody.maxTokens = maxTokens;
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

      return generatedContent;
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
        role: 'system',
        content: `You are an expert Space Designer AI. Your goal is to generate a cohesive space configuration based on the user's prompt.

RULES:
1. **Language**: All output (name, description) MUST be in English, even if the user prompt is in another language.
2. **Tagging**: Analyze the user's sentiment and intent. Select the most appropriate items from the "Available emotions" and "Available tags" lists below.
   - Select 2-4 emotions.
   - Select 3-6 tags.
   - You MUST ONLY use values from the provided lists. Do not invent new tags.
3. **Fonts**: 
   - Select one "clockFont" (style name) from the Available Clock Font Styles list.
   - Select one "textFont" (font name) from the Available Text Font Names list.
   - Match fonts to the overall vibe and mood of the space.
4. **Output**: Return ONLY a valid JSON object. Do not include markdown formatting (like \`\`\`json).

AVAILABLE LISTS:
- Emotions: ${context.emotions.join(', ')}
- Tags: ${context.tags.join(', ')}
- Moods: ${context.moods.join(', ')}
- Text Font Names: ${context.textFonts.join(', ')}
- Clock Font Styles: ${context.clockFonts.join(', ')}

JSON FORMAT:
{
  "name": "A creative and short English name for the space",
  "description": "A short English description of the space's vibe (max 2 sentences)",
  "clockFont": "Exact style string from Available Clock Font Styles",
  "textFont": "Exact font name from Available Text Font Names",
  "emotions": ["Exact string from Available Emotions", ...],
  "tags": ["Exact string from Available Tags", ...]
}`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.7
      // Removed maxTokens to match working API format
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

      logger.info('[NAVER API] Successfully parsed AI response', {
        parsed: {
          name: parsed.name,
          description: parsed.description?.substring(0, 100),
          emotionsCount: parsed.emotions?.length,
          tagsCount: parsed.tags?.length,
          clockFont: parsed.clockFont,
          textFont: parsed.textFont
        }
      });
      return parsed;
    } catch (error) {
      logger.error('[NAVER API] Failed to parse AI response', {
        error: error.message,
        responseLength: response.length,
        responsePreview: response.substring(0, 500) // Log first 500 chars for debugging
      });
      // Fallback to mock response
      return {
        name: `AI Generated Space`,
        description: `Space created based on: ${prompt.substring(0, 100)}`,
        clockFont: context.clockFonts[0],
        textFont: context.textFonts[0],
        emotions: ['calm', 'peaceful'],
        tags: ['ambient', 'relax', 'focus']
      };
    }
  }
}

export default new NaverApiService();
