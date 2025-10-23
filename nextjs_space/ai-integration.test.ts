// __tests__/ai-integration.test.ts

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  saveAPIConfig,
  loadAPIConfig,
  deleteAPIConfig,
  isAIConfigured,
  testAPIConnection
} from '../lib/ai-config';
import { enhanceWithAI } from '../lib/ai-enhancer';
import { performEnhancedTransformation } from '../lib/enhanced-transformer';

describe('AI Configuration', () => {
  beforeEach(() => {
    // Clear localStorage (mocked in Jest environment)
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should save and load API config', () => {
    const config = {
      enabled: true,
      provider: 'openai' as const,
      apiKey: 'test-key',
      model: 'gpt-4'
    };
    saveAPIConfig(config);
    const loaded = loadAPIConfig();
    expect(loaded).toEqual(config);
  });

  it('should delete API config', () => {
    const config = {
      enabled: true,
      provider: 'openai' as const,
      apiKey: 'test-key',
      model: 'gpt-4'
    };
    saveAPIConfig(config);
    deleteAPIConfig();
    const loaded = loadAPIConfig();
    expect(loaded).toBeNull();
  });

  it('should check if AI configured', () => {
    expect(isAIConfigured()).toBe(false);
    saveAPIConfig({
      enabled: true,
      provider: 'openai',
      apiKey: 'test',
      model: 'gpt-4'
    });
    expect(isAIConfigured()).toBe(true);
  });
});

describe('AI Enhancement', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn() as any;
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should enhance output with AI', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: { content: 'Enhanced output' }
        }],
        usage: { total_tokens: 100 }
      })
    });
    saveAPIConfig({
      enabled: true,
      provider: 'openai',
      apiKey: 'test',
      model: 'gpt-4'
    });
    const result = await enhanceWithAI('rule-based output', 'original input');
    expect(result.success).toBe(true);
    expect(result.enhancedPrompt).toBe('Enhanced output');
  });
  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid key' } })
    });
    saveAPIConfig({
      enabled: true,
      provider: 'openai',
      apiKey: 'invalid',
      model: 'gpt-4'
    });
    const result = await enhanceWithAI('output', 'input');
    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
  });
});

describe('Enhanced Transformation Workflow', () => {
  it('should perform rule-based transformation when AI disabled', async () => {
    const result = await performEnhancedTransformation('test input', { enableAI: false });
    expect(result.method).toBe('rule-based');
    expect(result.output).toBeDefined();
  });
  it('should preserve Success Criteria', async () => {
    const input = 'Create plan with SC1: Timeline, SC2: Budget';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: { content: 'Enhanced plan with SC1: Timeline, SC2: Budget' }
        }],
        usage: { total_tokens: 100 }
      })
    });
    saveAPIConfig({
      enabled: true,
      provider: 'openai',
      apiKey: 'test',
      model: 'gpt-4'
    });
    const result = await performEnhancedTransformation(input, { enableAI: true });
    expect(result.output).toContain('SC1');
    expect(result.output).toContain('SC2');
  });
  it('should enforce character limit', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'x'.repeat(1000) } }],
        usage: { total_tokens: 100 }
      })
    });
    saveAPIConfig({
      enabled: true,
      provider: 'openai',
      apiKey: 'test',
      model: 'gpt-4'
    });
    const result = await performEnhancedTransformation('input', { enableAI: true, charLimit: 500 });
    expect(result.output.length).toBeLessThanOrEqual(500);
  });
});

describe('Backwards Compatibility', () => {
  it('should not break existing transformation', async () => {
    const input = 'Create project plan';
    const result = await performEnhancedTransformation(input, { enableAI: false });
    expect(result.output).toBeDefined();
    expect(result.method).toBe('rule-based');
  });
});