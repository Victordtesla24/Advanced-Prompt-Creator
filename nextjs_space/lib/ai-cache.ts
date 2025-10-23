// lib/ai-cache.ts

import type { AIEnhancementResult } from './ai-enhancer';
import { enhanceWithAI } from './ai-enhancer';

interface CacheEntry {
  input: string;
  output: string;
  timestamp: number;
}

const CACHE_DURATION = 3600000; // 1 hour
const cache = new Map<string, CacheEntry>();

// Simple hash function for strings
function hashInput(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

export function getCachedResult(input: string): string | null {
  const key = hashInput(input);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return entry.output;
}

export function cacheResult(input: string, output: string): void {
  const key = hashInput(input);
  cache.set(key, {
    input,
    output,
    timestamp: Date.now()
  });
  // Limit cache size to 100 entries
  if (cache.size > 100) {
    const oldest = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) {
      cache.delete(oldest[0]);
    }
  }
}

// Debounce state
let lastRequest: { input: string; timestamp: number } | null = null;
const DEBOUNCE_MS = 2000;

/**
 * Perform AI enhancement with caching and debouncing
 */
export async function debouncedEnhance(
  ruleBasedOutput: string,
  originalInput: string
): Promise<AIEnhancementResult> {
  const now = Date.now();
  if (lastRequest && lastRequest.input === originalInput && now - lastRequest.timestamp < DEBOUNCE_MS) {
    throw new Error('Duplicate request. Please wait.');
  }
  lastRequest = { input: originalInput, timestamp: now };
  const cached = getCachedResult(originalInput);
  if (cached) {
    return {
      success: true,
      enhancedPrompt: cached,
      processingTime: 0,
      provider: 'cache',
      model: 'cache',
      fallback: false
    };
  }
  const result = await enhanceWithAI(ruleBasedOutput, originalInput);
  if (result.success && result.enhancedPrompt) {
    cacheResult(originalInput, result.enhancedPrompt);
  }
  return result;
}