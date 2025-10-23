// lib/enhanced-transformer.ts

import { transformPrompt } from './transformer';
import { isAIConfigured } from './ai-config';
import { enhanceWithSCValidation } from './sc-validator';
import { extractFileContext } from './file-processor';
import type { AIEnhancementResult } from './ai-enhancer';

export interface EnhancedTransformResult {
  output: string;
  method: 'rule-based' | 'ai-enhanced';
  ruleBasedOutput: string;
  aiEnhancementResult?: AIEnhancementResult;
  totalProcessingTime: number;
  truncated?: boolean;
}

export async function performEnhancedTransformation(
  input: string,
  options: {
    enableAI?: boolean;
    charLimit?: number;
    files?: File[];
  } = {}
): Promise<EnhancedTransformResult> {
  const startTime = Date.now();

  // Extract file context if provided
  let enhancedInput = input;
  if (options.files && options.files.length > 0) {
    const contexts: string[] = [];
    for (const file of options.files) {
      try {
        // Use extractFileContext from file-processor to get content summary
        const ctx = await extractFileContext(file as any);
        const content = ctx.content || '';
        contexts.push(`**${file.name}:**\n${content.substring(0, 1000)}`);
      } catch (err) {
        console.error(`Failed to extract from ${file.name}:`, err);
      }
    }
    if (contexts.length > 0) {
      enhancedInput = `${input}\n\n## Additional Context from Files:\n\n${contexts.join('\n\n')}`;
    }
  }

  // Step 1: Rule-based transformation with enhanced input
  // Pass through charLimit and file_context for backwards compatibility
  const rbResult = await transformPrompt(enhancedInput, {
    char_limit: options.charLimit,
    file_context: undefined
  } as any);
  const ruleBasedOutput = rbResult.transformed_prompt;

  // Decide whether to use AI
  const shouldEnhanceWithAI = options.enableAI && isAIConfigured();
  if (!shouldEnhanceWithAI) {
    let finalOutput = ruleBasedOutput;
    if (options.charLimit && finalOutput.length > options.charLimit) {
      finalOutput = smartTruncate(finalOutput, options.charLimit);
    }
    return {
      output: finalOutput,
      method: 'rule-based',
      ruleBasedOutput,
      totalProcessingTime: Date.now() - startTime,
      truncated: options.charLimit ? finalOutput.length < ruleBasedOutput.length : false
    };
  }

  // Step 2: AI enhancement with SC validation
  const aiResult = await enhanceWithSCValidation(ruleBasedOutput, enhancedInput);
  if (aiResult.success && aiResult.enhancedPrompt) {
    let finalOutput = aiResult.enhancedPrompt;
    if (options.charLimit && finalOutput.length > options.charLimit) {
      finalOutput = smartTruncate(finalOutput, options.charLimit);
    }
    return {
      output: finalOutput,
      method: 'ai-enhanced',
      ruleBasedOutput,
      aiEnhancementResult: aiResult,
      totalProcessingTime: Date.now() - startTime,
      truncated: options.charLimit ? finalOutput.length < aiResult.enhancedPrompt.length : false
    };
  }
  // Fallback: return rule-based or AI result error message
  let fallbackOutput = ruleBasedOutput;
  if (options.charLimit && fallbackOutput.length > (options.charLimit || 0)) {
    fallbackOutput = smartTruncate(fallbackOutput, options.charLimit as number);
  }
  return {
    output: fallbackOutput,
    method: 'rule-based',
    ruleBasedOutput,
    aiEnhancementResult: aiResult,
    totalProcessingTime: Date.now() - startTime,
    truncated: options.charLimit ? fallbackOutput.length < ruleBasedOutput.length : false
  };
}

/**
 * Smart truncate: preserve section headers and structure
 */
function smartTruncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const truncated = text.substring(0, limit);
  // Attempt to find last section header (## ) within last 30% of the truncated portion
  const lastSectionBreak = truncated.lastIndexOf('\n## ');
  if (lastSectionBreak > limit * 0.7) {
    return text.substring(0, lastSectionBreak) + '\n\n[Output truncated to meet character limit]';
  }
  return truncated + '\n\n[Output truncated to meet character limit]';
}