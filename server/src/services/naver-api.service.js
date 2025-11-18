import { NAVER_CLOVA_STUDIO_API_KEY } from '../config/env.js';
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

    this.apiKey = NAVER_CLOVA_STUDIO_API_KEY;
    this.baseUrl = 'https://clovastudio.stream.ntruss.com';
    this.model = 'HCX-007'; // HyperCLOVA X model
    this.maxRetries = 3;
    this.retryDelay = 1000; // Initial delay in milliseconds
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

    const url = `${this.baseUrl}/v3/chat-completions/${this.model}`;

    // Build request body
    const requestBody = {
      messages: messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' 
          ? [{ type: 'text', text: msg.content }]
          : msg.content,
      })),
      topP,
      topK,
      temperature,
      repetitionPenalty,
      stop,
      includeAiFilters,
    };

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
      logger.info(`[NAVER API] Chat completion request`, {
        model: this.model,
        thinkingEffort,
        messageCount: messages.length,
      });

      const response = await this.makeRequestWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      // Extract generated content
      // TODO: Add logic to instruct LLM to format responses in structured format (e.g., JSON)
      // For now, return raw text response
      const generatedContent = data.choices?.[0]?.message?.content || 
                              data.choices?.[0]?.content || 
                              data.content || 
                              '';

      logger.info(`[NAVER API] Chat completion successful`, {
        model: this.model,
        duration,
        tokensUsed: data.usage?.totalTokens || 'unknown',
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
}

export default new NaverApiService();

