
// lib/ai-enhancer.ts

import { loadAPIConfig, getAPIEndpoint, type APIConfig } from './ai-config';
import { parseAIError, showAIError, retryWithBackoff } from './ai-error-handler';

export interface AIEnhancementResult {
  success: boolean;
  enhancedPrompt?: string;
  error?: string;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  processingTime: number;
  provider: string;
  model: string;
  fallback: boolean;
}

/**
 * Enhance the rule-based output using AI
 */
export async function enhanceWithAI(
  ruleBasedOutput: string,
  originalInput: string
): Promise<AIEnhancementResult> {
  const startTime = Date.now();
  
  // Load API configuration
  const config = loadAPIConfig();
  
  if (!config || !config.enabled) {
    return {
      success: false,
      error: 'AI enhancement not configured',
      processingTime: Date.now() - startTime,
      provider: 'none',
      model: 'none',
      fallback: true
    };
  }

  try {
    // Use retry logic for retryable errors
    const result = await retryWithBackoff(
      () => callAIProvider(config, ruleBasedOutput, originalInput),
      3,
      1000
    );

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      enhancedPrompt: result.content,
      tokensUsed: result.tokensUsed,
      processingTime,
      provider: config.provider,
      model: config.model,
      fallback: false
    };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    const aiError = parseAIError(error);
    console.error('AI enhancement error:', aiError);
    // Show a toast error in UI if applicable
    try {
      showAIError(aiError);
    } catch (_) {
      // ignore toast errors in non-browser environments
    }
    return {
      success: false,
      error: aiError.userMessage,
      processingTime,
      provider: config.provider,
      model: config.model,
      fallback: true
    };
  }
}

/**
 * Call AI provider API
 */
async function callAIProvider(
  config: APIConfig,
  ruleBasedOutput: string,
  originalInput: string
): Promise<{ content: string; tokensUsed: any }> {
  
  const endpoint = getAPIEndpoint(config.provider);
  const messages = buildMessages(ruleBasedOutput, originalInput);
  
  const requestBody = {
    model: config.model,
    messages,
    max_tokens: config.maxTokens || 4000,
    temperature: config.temperature || 0.7
  };
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`
  };
  
  // Provider-specific adjustments
  if (config.provider === 'perplexity') {
    // Perplexity uses same format as OpenAI
  }
  
  console.log('API Request:', {
    endpoint,
    model: config.model,
    provider: config.provider,
    messageCount: messages.length,
    maxTokens: requestBody.max_tokens,
    temperature: requestBody.temperature
  });
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(30000) // 30 second timeout
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    console.log('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key');
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    
    if (response.status >= 500) {
      throw new Error('AI service unavailable');
    }
    
    throw new Error(errorData.error?.message || errorData.message || 'AI request failed');
  }
  
  const data = await response.json();
  
  // Extract content based on provider
  const content = extractContent(data, config.provider);
  const tokensUsed = extractTokenUsage(data);
  
  // Validate response format
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid AI response format');
  }
  
  return { content, tokensUsed };
}

/**
 * Build message array for AI prompt
 */
function buildMessages(
  ruleBasedOutput: string,
  originalInput: string
): Array<{ role: string; content: string }> {
  
  const systemPrompt = `You are a prompt engineering specialist. Your task is to refine and enhance an already well-structured hybrid prompt.

RULES:
1. PRESERVE all Success Criteria (SC1-SC10) - do not remove any
2. ENHANCE clarity, precision, and structure
3. IMPROVE wording for better AI comprehension
4. MAINTAIN the 8-section format (Context, Requirements, Objectives, Instructions, Success Criteria, Constraints, Output Format, Validation Loop)
5. DO NOT add new requirements not in original input
6. DO NOT remove existing requirements
7. IMPROVE Chain-of-Thought decomposition if present
8. ENSURE validation loop is clear and executable
9. OPTIMIZE for token efficiency (aim for <3x expansion from original)
10. OUTPUT must be in markdown format

OBJECTIVE: Make the hybrid prompt even more effective while preserving its intent and structure.`;

  const userPrompt = `Original User Input:
---
${originalInput}
---

Rule-Based Hybrid Prompt:
---
${ruleBasedOutput}
---

Please enhance this hybrid prompt by:
1. Clarifying ambiguous instructions
2. Improving task decomposition
3. Strengthening success criteria definitions
4. Optimizing wording for AI comprehension
5. Ensuring logical flow and coherence

Return ONLY the enhanced hybrid prompt in markdown format.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
}

/**
 * Extract content from provider response
 */
function extractContent(data: any, provider: string): string {
  switch (provider) {
    case 'openai':
    case 'perplexity':
      return data.choices?.[0]?.message?.content || '';
    
    case 'glm4':
      return data.choices?.[0]?.message?.content || '';
    
    default:
      return data.choices?.[0]?.message?.content || '';
  }
}

/**
 * Extract token usage from provider response
 */
function extractTokenUsage(data: any): any {
  if (data.usage) {
    const input = data.usage.input_tokens || data.usage.prompt_tokens || 0;
    const output = data.usage.output_tokens || data.usage.completion_tokens || 0;
    const total = data.usage.total_tokens || (input + output);
    
    return {
      input,
      output,
      total
    };
  }
  
  return {
    input: 0,
    output: 0,
    total: 0
  };
}
