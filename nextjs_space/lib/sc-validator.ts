// lib/sc-validator.ts

import type { AIEnhancementResult } from './ai-enhancer';
import { enhanceWithAI } from './ai-enhancer';

export interface SuccessCriterion {
  id: string;
  text: string;
  present: boolean;
}

/**
 * Extract Success Criteria from text
 */
export function extractSuccessCriteria(text: string): SuccessCriterion[] {
  const scRegex = /SC\d+:?\s*[^\n]+/gi;
  const matches = text.match(scRegex) || [];
  return matches.map((match, index) => ({
    id: `SC${index + 1}`,
    text: match.trim(),
    present: true
  }));
}

/**
 * Validate that all original SCs are present in enhanced output
 */
export function validateSuccessCriteria(
  originalSCs: SuccessCriterion[],
  enhancedOutput: string
): {
  allPresent: boolean;
  missing: SuccessCriterion[];
  preservationRate: number;
} {
  const missing: SuccessCriterion[] = [];
  for (const sc of originalSCs) {
    const scText = sc.text.toLowerCase();
    const scNumber = sc.id.toLowerCase();
    const isPresent = enhancedOutput.toLowerCase().includes(scNumber) ||
      enhancedOutput.toLowerCase().includes(scText);
    if (!isPresent) {
      missing.push(sc);
    }
  }
  const preservationRate = originalSCs.length > 0
    ? (originalSCs.length - missing.length) / originalSCs.length
    : 1.0;
  return {
    allPresent: missing.length === 0,
    missing,
    preservationRate
  };
}

/**
 * Recursively enhance until all SCs preserved
 */
export async function enhanceWithSCValidation(
  ruleBasedOutput: string,
  originalInput: string,
  maxAttempts: number = 3
): Promise<AIEnhancementResult> {
  // Extract SCs from original input
  const originalSCs = extractSuccessCriteria(originalInput);
  if (originalSCs.length === 0) {
    // No SCs to validate, proceed normally
    return enhanceWithAI(ruleBasedOutput, originalInput);
  }
  let attempt = 0;
  let lastResult: AIEnhancementResult | null = null;
  while (attempt < maxAttempts) {
    attempt++;
    const result = await enhanceWithAI(ruleBasedOutput, originalInput);
    lastResult = result;
    if (!result.success || !result.enhancedPrompt) {
      return result;
    }
    const validation = validateSuccessCriteria(originalSCs, result.enhancedPrompt);
    if (validation.allPresent) {
      console.log(`✓ All Success Criteria preserved (attempt ${attempt})`);
      return result;
    }
    console.warn(
      `⚠ Missing SCs on attempt ${attempt}:`,
      validation.missing.map(sc => sc.id)
    );
    if (attempt < maxAttempts) {
      const scReminder = validation.missing
        .map(sc => sc.text)
        .join('\n');
      const enhancedInput = `${originalInput}\n\n**CRITICAL: Ensure these Success Criteria are included:**\n${scReminder}`;
      ruleBasedOutput = result.enhancedPrompt;
      originalInput = enhancedInput;
    }
  }
  console.error(`❌ Failed to preserve all SCs after ${maxAttempts} attempts`);
  return lastResult!;
}