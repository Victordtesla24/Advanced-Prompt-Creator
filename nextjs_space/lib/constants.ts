
/**
 * Application Constants
 * Centralized configuration for the Hybrid Prompt Transformer
 */

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Hybrid Prompt Transformer',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  deployUrl: process.env.NEXT_PUBLIC_DEPLOY_URL || 'https://hybrid-prompt-transf-vmuu3f.abacusai.app',
  env: process.env.NEXT_PUBLIC_APP_ENV || 'development',
};

export const FEATURE_FLAGS = {
  aiIntegration: process.env.NEXT_PUBLIC_ENABLE_AI_INTEGRATION === 'true',
  fileUpload: process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD === 'true',
  batchProcessing: process.env.NEXT_PUBLIC_ENABLE_BATCH_PROCESSING === 'true',
};

export const API_CONFIG = {
  rateLimit: parseInt(process.env.NEXT_PUBLIC_API_RATE_LIMIT || '100', 10),
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760', 10), // 10MB
};

export const STORAGE_KEYS = {
  aiConfig: 'ai_api_config',
  transformHistory: 'transform_history',
  userPreferences: 'user_preferences',
};

export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  perplexity: {
    name: 'Perplexity AI',
    models: ['llama-3.1-sonar-large-128k-online'],
    endpoint: 'https://api.perplexity.ai/chat/completions',
  },
  abacusai: {
    name: 'Abacus.AI',
    models: ['gpt-4', 'claude-3-opus', 'llama-3-70b'],
    endpoint: 'https://api.abacus.ai/v1/chat/complete',
  },
};

export const TOKEN_LIMITS = {
  maxInput: 100000,
  maxOutput: 16000,
  expansionLimit: 3, // Maximum allowed expansion factor
};

export const TIMEOUT_CONFIG = {
  apiRequest: 30000, // 30 seconds
  fileUpload: 60000, // 60 seconds
};

export const SUCCESS_CRITERIA = {
  minKeywordPreservation: 0.85, // 85%
  maxTokenExpansion: 3.0, // 3x
  minTransformationAccuracy: 0.95, // 95%
};
