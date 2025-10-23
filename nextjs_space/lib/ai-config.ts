// lib/ai-config.ts

export type AIProvider = 'openai' | 'perplexity' | 'glm4';

export interface APIConfig {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

const STORAGE_KEY = 'ai_api_config';

// In-memory storage for Node.js environment (testing)
let memoryStorage: APIConfig | null = null;

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Save AI API configuration (browser: localStorage, Node.js: memory)
 */
export function saveAPIConfig(config: APIConfig): void {
  try {
    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } else {
      // Node.js environment - use in-memory storage
      memoryStorage = config;
    }
  } catch (error) {
    console.error('Failed to save API config:', error);
    throw new Error('Could not save API configuration');
  }
}

/**
 * Load AI API configuration (browser: localStorage, Node.js: memory)
 */
export function loadAPIConfig(): APIConfig | null {
  try {
    let stored: string | null = null;
    
    if (isBrowser()) {
      stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
    } else {
      // Node.js environment - use in-memory storage
      if (!memoryStorage) return null;
      return memoryStorage;
    }
    
    const config = JSON.parse(stored) as APIConfig;
    
    // Validate structure
    if (!config.provider || !config.apiKey || !config.model) {
      return null;
    }
    
    return config;
  } catch (error) {
    console.error('Failed to load API config:', error);
    return null;
  }
}

/**
 * Delete AI API configuration (browser: localStorage, Node.js: memory)
 */
export function deleteAPIConfig(): void {
  try {
    if (isBrowser()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      // Node.js environment - clear in-memory storage
      memoryStorage = null;
    }
  } catch (error) {
    console.error('Failed to delete API config:', error);
  }
}

/**
 * Check if AI is configured and enabled
 */
export function isAIConfigured(): boolean {
  const config = loadAPIConfig();
  return config !== null && config.enabled === true;
}

/**
 * Get available models for a provider
 */
export function getModelsForProvider(provider: AIProvider): string[] {
  const modelMap: Record<AIProvider, string[]> = {
    openai: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'],
    perplexity: ['sonar', 'sonar-pro', 'sonar-reasoning', 'sonar-reasoning-pro', 'sonar-deep-research'],
    glm4: ['glm-4', 'glm-4-plus']
  };
  
  return modelMap[provider] || [];
}

/**
 * Get API endpoint for provider
 * Can optionally pass an API key to check if it's an Abacus.AI key
 */
export function getAPIEndpoint(provider: AIProvider, apiKey?: string): string {
  // Check if using Abacus.AI API key
  // Abacus.AI keys are 32-character hex strings (no 'sk-' prefix)
  const keyToCheck = apiKey || loadAPIConfig()?.apiKey || '';
  const isAbacusAIKey = keyToCheck.length === 32 && /^[0-9a-f]{32}$/.test(keyToCheck);
  
  if (isAbacusAIKey) {
    return 'https://apps.abacus.ai/v1/chat/completions';
  }
  
  const endpoints: Record<AIProvider, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    perplexity: 'https://api.perplexity.ai/chat/completions',
    glm4: 'https://api.z.ai/api/paas/v4/chat/completions'
  };
  
  return endpoints[provider];
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  latency?: number;
}

/**
 * Test API connection with provided credentials
 */
export async function testAPIConnection(
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<TestConnectionResult> {
  const startTime = Date.now();
  
  try {
    const endpoint = getAPIEndpoint(provider, apiKey);
    
    // Prepare test request based on provider
    const requestBody = prepareTestRequest(provider, model);
    const headers = prepareHeaders(provider, apiKey);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      // Parse error response
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: 'Invalid API key. Please check your credentials.',
          latency
        };
      }
      
      if (response.status === 429) {
        return {
          success: false,
          message: 'Rate limit exceeded. Please try again later.',
          latency
        };
      }
      
      return {
        success: false,
        message: errorData.error?.message || 'Connection failed. Please try again.',
        latency
      };
    }
    
    // Success
    return {
      success: true,
      message: `Connected successfully to ${provider} (${latency}ms)`,
      latency
    };
    
  } catch (error: any) {
    const latency = Date.now() - startTime;
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return {
        success: false,
        message: 'Connection timeout. Please check your network.',
        latency
      };
    }
    
    return {
      success: false,
      message: `Network error: ${error.message}`,
      latency
    };
  }
}

/**
 * Prepare test request body based on provider
 */
function prepareTestRequest(provider: AIProvider, model: string): any {
  const baseRequest = {
    model,
    messages: [
      {
        role: 'user',
        content: 'Test connection'
      }
    ],
    max_tokens: 10
  };
  
  // Provider-specific adjustments
  switch (provider) {
    case 'openai':
      return baseRequest;
    
    case 'perplexity':
      return baseRequest;
    
    case 'glm4':
      return {
        model,
        messages: baseRequest.messages,
        max_tokens: 10
      };
    
    default:
      return baseRequest;
  }
}

/**
 * Prepare request headers based on provider
 */
function prepareHeaders(provider: AIProvider, apiKey: string): Record<string, string> {
  const baseHeaders = {
    'Content-Type': 'application/json'
  };
  
  switch (provider) {
    case 'openai':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${apiKey}`
      };
    
    case 'perplexity':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${apiKey}`
      };
    
    case 'glm4':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${apiKey}`
      };
    
    default:
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${apiKey}`
      };
  }
}
