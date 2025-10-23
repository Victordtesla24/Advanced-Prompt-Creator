
// test-ai-enhancement.ts
// Comprehensive AI Enhancement Testing Suite

import { enhanceWithAI } from './lib/ai-enhancer';
import { saveAPIConfig, loadAPIConfig } from './lib/ai-config';
import * as fs from 'fs';

interface TestResult {
  testName: string;
  success: boolean;
  details: any;
  metrics?: {
    processingTime: number;
    tokensUsed?: any;
    provider: string;
    model: string;
  };
  validation?: {
    outputQuality: string;
    scPreservation: boolean;
    formatMaintained: boolean;
    clarityImproved: boolean;
    tokenEfficiency: string;
  };
  error?: string;
}

const testResults: TestResult[] = [];

// Sample rule-based output for testing
const sampleRuleBased = `# Hybrid Prompt: Data Analysis Task

## 1. Context & Background
You are a data analyst working on customer behavior analysis.

## 2. Requirements
- Analyze customer purchase patterns
- Identify trends
- Generate insights

## 3. Objectives
Create a comprehensive analysis report.

## 4. Instructions
1. Load the data
2. Clean and preprocess
3. Analyze patterns
4. Generate visualizations

## 5. Success Criteria
- SC1: Data loaded correctly
- SC2: No missing values
- SC3: Trends identified
- SC4: Report generated

## 6. Constraints
- Time: 2 hours
- Budget: $100

## 7. Output Format
Markdown report with visualizations

## 8. Validation Loop
Verify all success criteria met`;

const sampleOriginalInput = `Analyze customer purchase patterns and create a report`;

// Test 1: Valid Configuration with OpenAI
async function test1_ValidOpenAIConfiguration() {
  console.log('\n=== Test 1: Valid OpenAI Configuration ===\n');
  
  try {
    const config = {
      enabled: true,
      provider: 'openai' as const,
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
      model: 'gpt-4o-mini',
      maxTokens: 4000,
      temperature: 0.7
    };
    
    saveAPIConfig(config);
    console.log('✓ Configuration saved');
    
    const startTime = Date.now();
    const result = await enhanceWithAI(sampleRuleBased, sampleOriginalInput);
    const totalTime = Date.now() - startTime;
    
    console.log('Result:', {
      success: result.success,
      processingTime: result.processingTime,
      provider: result.provider,
      model: result.model,
      fallback: result.fallback,
      hasEnhancedPrompt: !!result.enhancedPrompt,
      tokensUsed: result.tokensUsed,
      error: result.error
    });
    
    if (result.success && result.enhancedPrompt) {
      console.log('\n--- Enhanced Prompt Preview (first 500 chars) ---');
      console.log(result.enhancedPrompt.substring(0, 500) + '...\n');
      
      // Validate output quality
      const validation = validateEnhancedOutput(
        sampleRuleBased,
        result.enhancedPrompt,
        sampleOriginalInput
      );
      
      console.log('Quality Validation:', validation);
      
      testResults.push({
        testName: 'Test 1: Valid OpenAI Configuration',
        success: result.success,
        details: {
          enhancedPromptLength: result.enhancedPrompt.length,
          originalLength: sampleRuleBased.length,
          expansionRatio: (result.enhancedPrompt.length / sampleRuleBased.length).toFixed(2)
        },
        metrics: {
          processingTime: result.processingTime,
          tokensUsed: result.tokensUsed,
          provider: result.provider,
          model: result.model
        },
        validation
      });
      
      return { success: true, result, validation };
    } else {
      testResults.push({
        testName: 'Test 1: Valid OpenAI Configuration',
        success: false,
        details: result,
        error: result.error
      });
      
      return { success: false, error: result.error };
    }
    
  } catch (error: any) {
    console.error('Test 1 Error:', error.message);
    testResults.push({
      testName: 'Test 1: Valid OpenAI Configuration',
      success: false,
      details: {},
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

// Test 2: Valid Configuration with Perplexity
async function test2_ValidPerplexityConfiguration() {
  console.log('\n=== Test 2: Valid Perplexity Configuration ===\n');
  
  try {
    const config = {
      enabled: true,
      provider: 'perplexity' as const,
      apiKey: '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',
      model: 'sonar-pro',
      maxTokens: 4000,
      temperature: 0.7
    };
    
    saveAPIConfig(config);
    console.log('✓ Configuration saved');
    
    const result = await enhanceWithAI(sampleRuleBased, sampleOriginalInput);
    
    console.log('Result:', {
      success: result.success,
      processingTime: result.processingTime,
      provider: result.provider,
      model: result.model,
      fallback: result.fallback,
      tokensUsed: result.tokensUsed,
      error: result.error
    });
    
    if (result.success && result.enhancedPrompt) {
      console.log('\n--- Enhanced Prompt Preview (first 500 chars) ---');
      console.log(result.enhancedPrompt.substring(0, 500) + '...\n');
      
      const validation = validateEnhancedOutput(
        sampleRuleBased,
        result.enhancedPrompt,
        sampleOriginalInput
      );
      
      console.log('Quality Validation:', validation);
      
      testResults.push({
        testName: 'Test 2: Valid Perplexity Configuration',
        success: result.success,
        details: {
          enhancedPromptLength: result.enhancedPrompt.length,
          originalLength: sampleRuleBased.length,
          expansionRatio: (result.enhancedPrompt.length / sampleRuleBased.length).toFixed(2)
        },
        metrics: {
          processingTime: result.processingTime,
          tokensUsed: result.tokensUsed,
          provider: result.provider,
          model: result.model
        },
        validation
      });
      
      return { success: true, result, validation };
    } else {
      testResults.push({
        testName: 'Test 2: Valid Perplexity Configuration',
        success: false,
        details: result,
        error: result.error
      });
      
      return { success: false, error: result.error };
    }
    
  } catch (error: any) {
    console.error('Test 2 Error:', error.message);
    testResults.push({
      testName: 'Test 2: Valid Perplexity Configuration',
      success: false,
      details: {},
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

// Test 3: Invalid API Key (Error Handling)
async function test3_InvalidAPIKey() {
  console.log('\n=== Test 3: Invalid API Key (Error Handling) ===\n');
  
  try {
    const config = {
      enabled: true,
      provider: 'openai' as const,
      apiKey: 'sk-invalid-key-12345',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7
    };
    
    saveAPIConfig(config);
    console.log('✓ Invalid configuration saved');
    
    const result = await enhanceWithAI(sampleRuleBased, sampleOriginalInput);
    
    console.log('Result:', {
      success: result.success,
      error: result.error,
      fallback: result.fallback,
      provider: result.provider
    });
    
    const testPassed = !result.success && result.fallback && !!result.error;
    
    testResults.push({
      testName: 'Test 3: Invalid API Key (Error Handling)',
      success: testPassed,
      details: {
        errorMessage: result.error,
        fallbackActivated: result.fallback,
        processingTime: result.processingTime
      }
    });
    
    console.log('Test 3 Status:', testPassed ? '✅ PASS' : '❌ FAIL');
    
    return { success: testPassed, result };
    
  } catch (error: any) {
    console.error('Test 3 Error:', error.message);
    testResults.push({
      testName: 'Test 3: Invalid API Key',
      success: false,
      details: {},
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

// Test 4: Disabled Configuration
async function test4_DisabledConfiguration() {
  console.log('\n=== Test 4: Disabled Configuration ===\n');
  
  try {
    const config = {
      enabled: false,
      provider: 'openai' as const,
      apiKey: 'sk-valid-key',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7
    };
    
    saveAPIConfig(config);
    console.log('✓ Disabled configuration saved');
    
    const result = await enhanceWithAI(sampleRuleBased, sampleOriginalInput);
    
    console.log('Result:', {
      success: result.success,
      error: result.error,
      fallback: result.fallback,
      processingTime: result.processingTime
    });
    
    const testPassed = !result.success && 
                       result.fallback && 
                       result.error === 'AI enhancement not configured' &&
                       result.processingTime < 100;
    
    testResults.push({
      testName: 'Test 4: Disabled Configuration',
      success: testPassed,
      details: {
        errorMessage: result.error,
        fallbackActivated: result.fallback,
        processingTime: result.processingTime,
        fastReturn: result.processingTime < 100
      }
    });
    
    console.log('Test 4 Status:', testPassed ? '✅ PASS' : '❌ FAIL');
    
    return { success: testPassed, result };
    
  } catch (error: any) {
    console.error('Test 4 Error:', error.message);
    testResults.push({
      testName: 'Test 4: Disabled Configuration',
      success: false,
      details: {},
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

// Validate enhanced output quality
function validateEnhancedOutput(
  original: string,
  enhanced: string,
  userInput: string
): {
  outputQuality: string;
  scPreservation: boolean;
  formatMaintained: boolean;
  clarityImproved: boolean;
  tokenEfficiency: string;
  detailedAnalysis: any;
} {
  // Check SC preservation
  const originalSCs = original.match(/SC\d+:/g) || [];
  const enhancedSCs = enhanced.match(/SC\d+:/g) || [];
  const scPreservation = originalSCs.length > 0 && 
                         enhancedSCs.length >= originalSCs.length;
  
  // Check format maintenance (8 sections)
  const sections = [
    'Context', 'Requirements', 'Objectives', 'Instructions',
    'Success Criteria', 'Constraints', 'Output Format', 'Validation'
  ];
  
  const sectionsFound = sections.filter(section => 
    enhanced.toLowerCase().includes(section.toLowerCase())
  ).length;
  
  const formatMaintained = sectionsFound >= 6; // At least 6 out of 8
  
  // Check token efficiency
  const expansionRatio = enhanced.length / original.length;
  let tokenEfficiency = 'Excellent';
  if (expansionRatio > 3) tokenEfficiency = 'Poor';
  else if (expansionRatio > 2) tokenEfficiency = 'Fair';
  else if (expansionRatio > 1.5) tokenEfficiency = 'Good';
  
  // Check clarity (presence of clear instructions, structure)
  const hasNumberedSteps = /\d+\.\s/.test(enhanced);
  const hasSubSections = /##/.test(enhanced);
  const clarityImproved = hasNumberedSteps && hasSubSections;
  
  // Overall quality
  let outputQuality = 'Poor';
  const qualityScore = [scPreservation, formatMaintained, clarityImproved]
    .filter(Boolean).length;
  
  if (qualityScore === 3) outputQuality = 'Excellent';
  else if (qualityScore === 2) outputQuality = 'Good';
  else if (qualityScore === 1) outputQuality = 'Fair';
  
  return {
    outputQuality,
    scPreservation,
    formatMaintained,
    clarityImproved,
    tokenEfficiency,
    detailedAnalysis: {
      originalLength: original.length,
      enhancedLength: enhanced.length,
      expansionRatio: expansionRatio.toFixed(2),
      originalSCCount: originalSCs.length,
      enhancedSCCount: enhancedSCs.length,
      sectionsFound,
      hasNumberedSteps,
      hasSubSections
    }
  };
}

// Generate comprehensive test report
function generateTestReport() {
  const passedTests = testResults.filter(t => t.success).length;
  const totalTests = testResults.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(2);
  
  const report = {
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      passRate: `${passRate}%`,
      timestamp: new Date().toISOString()
    },
    tests: testResults,
    successCriteria: {
      'SC-01: API Connection successful': testResults.some(t => 
        t.testName.includes('Valid') && t.success
      ),
      'SC-02: Accurate prompt Body and Headers': testResults.some(t => 
        t.success && t.metrics
      ),
      'SC-03: Valid response received': testResults.some(t => 
        t.success && t.details?.enhancedPromptLength > 0
      ),
      'SC-04: Response extracted and analyzed': testResults.some(t => 
        t.success && t.validation
      ),
      'SC-05: Token usage tracked': testResults.some(t => 
        t.success && t.metrics?.tokensUsed
      ),
      'SC-06: Processing time measured': testResults.some(t => 
        t.success && t.metrics?.processingTime
      ),
      'SC-07: API errors caught': testResults.some(t => 
        t.testName.includes('Invalid') && !t.success
      )
    }
  };
  
  return report;
}

// Main test runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     AI ENHANCEMENT COMPREHENSIVE TEST SUITE                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  try {
    // Run all tests
    await test1_ValidOpenAIConfiguration();
    await test2_ValidPerplexityConfiguration();
    await test3_InvalidAPIKey();
    await test4_DisabledConfiguration();
    
    // Generate report
    const report = generateTestReport();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     TEST SUMMARY                                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('Total Tests:', report.summary.totalTests);
    console.log('Passed:', report.summary.passedTests, '✅');
    console.log('Failed:', report.summary.failedTests, '❌');
    console.log('Pass Rate:', report.summary.passRate);
    
    console.log('\n--- Success Criteria Status ---');
    Object.entries(report.successCriteria).forEach(([sc, status]) => {
      console.log(`${status ? '✅' : '❌'} ${sc}`);
    });
    
    // Save report to file
    fs.writeFileSync(
      'ai-enhancement-test-results.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n✓ Full report saved to: ai-enhancement-test-results.json');
    
    return report;
    
  } catch (error: any) {
    console.error('Test suite error:', error);
    throw error;
  }
}

// Run tests
runAllTests()
  .then((report) => {
    console.log('\n✅ Test suite completed successfully');
    process.exit(report.summary.failedTests > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
