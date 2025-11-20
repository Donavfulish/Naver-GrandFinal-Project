# NAVER API Service Usage Documentation

This document provides information about using the NAVER API service for LLM chat completions.

## Overview

The `naver-api.service.js` provides a service layer for interacting with NAVER Cloud Platform's CLOVA Studio API, specifically the HyperCLOVA X (HCX-007) model for chat completions.

## Setup

### Environment Variables

Add the following to your `.env` file:

```env
NAVER_CLOVA_STUDIO_API_KEY="your-api-key-here"
```

You can obtain your API key from the NAVER Cloud Platform console.

## Usage

### Basic Import

```javascript
import naverApiService from '../services/naver-api.service.js';
```

### Chat Completion

The `chatCompletion` method generates text completions using the HCX-007 model.

#### Basic Usage

```javascript
const messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant.'
  },
  {
    role: 'user',
    content: 'Hello, how are you?'
  }
];

const response = await naverApiService.chatCompletion(messages);
console.log(response); // Generated text content
```

#### With Reasoning Effort

```javascript
const messages = [
  {
    role: 'user',
    content: 'Analyze this complex problem step by step...'
  }
];

// Use high reasoning effort for complex analysis
const response = await naverApiService.chatCompletion(messages, {
  thinkingEffort: 'high' // Options: 'none', 'low', 'medium', 'high'
});
```

#### With Custom Parameters

```javascript
const response = await naverApiService.chatCompletion(messages, {
  thinkingEffort: 'medium',
  temperature: 0.7,        // Higher = more creative (0.00-1.00)
  maxCompletionTokens: 1024, // Max tokens to generate
  topP: 0.9,              // Nucleus sampling (0.00-1.00)
  repetitionPenalty: 1.2,  // Penalty for repetition (0-2.0)
  stop: ['\n\n'],         // Stop sequences
  includeAiFilters: true  // Include AI filter results
});
```

## Parameters

### Messages Array

Each message object must have:
- `role`: `'system'`, `'user'`, or `'assistant'`
- `content`: String or array of content objects

```javascript
[
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the weather?' },
  { role: 'assistant', content: 'I cannot check the weather...' }
]
```

### Options Object

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `thinkingEffort` | `string` | `'low'` | Reasoning effort: `'none'`, `'low'`, `'medium'`, `'high'` |
| `temperature` | `number` | `0.5` | Token diversity (0.00-1.00) |
| `maxTokens` | `number` | - | Max tokens (non-thinking mode) |
| `maxCompletionTokens` | `number` | `512` | Max completion tokens (thinking mode) |
| `topP` | `number` | `0.8` | Cumulative probability sampling (0.00-1.00) |
| `topK` | `number` | `0` | Top K candidates (0-128) |
| `repetitionPenalty` | `number` | `1.1` | Penalty for repetition (0-2.0) |
| `stop` | `Array<string>` | `[]` | Stop sequences |
| `includeAiFilters` | `boolean` | `false` | Include AI filter results |

## Error Handling

The service includes automatic retry logic with exponential backoff for transient failures. Errors are thrown with appropriate error codes:

```javascript
try {
  const response = await naverApiService.chatCompletion(messages);
} catch (error) {
  console.error('Error:', error.message);
  console.error('Error Code:', error.code);
  console.error('Status Code:', error.statusCode);
  
  // Error codes:
  // - NAVER_API_AUTH_FAILED (401/403)
  // - NAVER_API_RATE_LIMIT (429)
  // - NAVER_API_INVALID_REQUEST (400-499)
  // - NAVER_API_ERROR (500+)
  // - NAVER_API_TIMEOUT (network errors)
}
```

## Use Cases

### Space Creation (Low Reasoning)

```javascript
const messages = [
  {
    role: 'system',
    content: 'You are a space creation assistant. Generate space configurations based on user emotions.'
  },
  {
    role: 'user',
    content: 'Create a space for a happy, productive mood'
  }
];

const response = await naverApiService.chatCompletion(messages, {
  thinkingEffort: 'low',
  temperature: 0.6
});
```

### Behavioral Analysis (High Reasoning)

```javascript
const messages = [
  {
    role: 'system',
    content: 'You are a behavioral analyst. Analyze user behavior and provide insights.'
  },
  {
    role: 'user',
    content: 'User spent 5 minutes in space, wrote 4 emotional notes, seems stressed...'
  }
];

const response = await naverApiService.chatCompletion(messages, {
  thinkingEffort: 'high',
  maxCompletionTokens: 1024,
  temperature: 0.5
});
```

## Response Format

Currently, the service returns raw text responses. 

**TODO**: Future implementation will include logic to instruct the LLM to format responses in structured formats (e.g., JSON) based on use case requirements.

## Logging

The service logs all API requests and responses (excluding sensitive data):
- Request attempts and retries
- Success/failure status
- Request duration
- Token usage (when available)

Check the logs directory for detailed information.

## Rate Limiting

The service automatically handles rate limits (429 status) by:
1. Reading `Retry-After` header if available
2. Using exponential backoff if header not present
3. Retrying up to 3 times

## Notes

- The service does not require user authentication for MVP
- All API calls are logged for monitoring
- Network errors are automatically retried
- Client errors (4xx) are not retried except for rate limits

