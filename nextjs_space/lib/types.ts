// Hybrid Prompt Transformer Types
// All types related to the prompt transformation process

export interface TransformationResult {
  transformed_prompt: string;
  process_details: ProcessDetails;
}

export interface ProcessDetails {
  original_analysis: {
    wordCount: number;
    sentenceCount: number;
    lineCount: number;
    successCriteria: string[];
    requirements: string[];
    objectives: string[];
    complexity: number;
  };
  sc_extraction: string[];
  validation_log: string[];
  structure_compliance: {
    required: number;
    found: number;
    missing: string[];
    compliance_rate: number;
  };
  token_metrics: {
    original_tokens: number;
    transformed_tokens: number;
    expansion_ratio: number;
    efficiency_rating: string;
  };
  techniques_applied: string[];
}

export interface TestResult {
  test_name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
}

export interface TestSummary {
  total_tests: number;
  passed: number;
  failed: number;
  success_rate: number;
  overall_status: string;
  detailed_results: TestResult[];
}

export interface TransformationHistoryItem {
  input: string;
  output: string;
  timestamp: number;
}

export interface TransformationOptions {
  max_iterations?: number;
  include_details?: boolean;
  mode?: 'minimal' | 'standard' | 'comprehensive';
}