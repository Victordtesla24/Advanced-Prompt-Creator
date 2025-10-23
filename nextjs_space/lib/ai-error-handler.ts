// lib/ai-error-handler.ts

import { toast } from 'sonner';

export type AIErrorType =
  | 'invalid-key'
  | 'rate-limit'
  | 'timeout'
  | 'service-unavailable'
  | 'invalid-response'
  | 'network-error'
  | 'unknown';

export interface AIError {
  type: AIErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  retryAfter?: number; // seconds
}

/**
 * Parse AI API error and provide user-friendly message
 */
export function parseAIError(error: any, response?: Response): AIError {
  // Invalid API Key (401/403)
  if (response?.status === 401 || response?.status === 403) {
    return {
      type: 'invalid-key',
      message: 'API authentication failed',
      userMessage: 'Invalid API key. Please check your settings.',
      retryable: false
    };
  }

  // Rate Limit (429)
  if (response?.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
    return {
      type: 'rate-limit',
      message: 'Rate limit exceeded',
      userMessage: `Rate limit reached. Retry in ${retryAfter} seconds.`,
      retryable: true,
      retryAfter
    };
  }

  // Service Unavailable (500/503)
  if (response?.status && response.status >= 500) {
    return {
      type: 'service-unavailable',
      message: 'AI service unavailable',
      userMessage: 'AI service temporarily unavailable. Please try again later.',
      retryable: true,
      retryAfter: 60
    };
  }

  // Timeout
  if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
    return {
      type: 'timeout',
      message: 'Request timeout',
      userMessage: 'AI request timed out. Please try again.',
      retryable: true
    };
  }

  // Network Error
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return {
      type: 'network-error',
      message: 'Network connection failed',
      userMessage: 'Connection failed. Check your internet connection.',
      retryable: true
    };
  }

  // Invalid Response Format
  if (error?.message?.includes('Invalid') || error?.message?.includes('format')) {
    return {
      type: 'invalid-response',
      message: 'Invalid AI response',
      userMessage: 'AI returned unexpected format. Using rule-based output.',
      retryable: false
    };
  }

  // Unknown Error
  return {
    type: 'unknown',
    message: error?.message || 'Unknown error',
    userMessage: 'An unexpected error occurred. Using rule-based output.',
    retryable: false
  };
}

/**
 * Show error toast with appropriate message and actions
 */
export function showAIError(aiError: AIError, onRetry?: () => void) {
  const { userMessage, retryable, retryAfter } = aiError;

  if (retryable && onRetry) {
    toast.error(userMessage, {
      action: {
        label: retryAfter ? `Retry in ${retryAfter}s` : 'Retry',
        onClick: onRetry
      },
      duration: retryAfter ? retryAfter * 1000 : 5000
    });
  } else {
    toast.error(userMessage, {
      action: aiError.type === 'invalid-key'
        ? {
            label: 'Open Settings',
            onClick: () => {
              // Will trigger settings modal open
              window.dispatchEvent(new CustomEvent('open-ai-settings'));
            }
          }
        : undefined,
      duration: 5000
    });
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const aiError = parseAIError(error);
      if (!aiError.retryable) {
        throw error;
      }
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}