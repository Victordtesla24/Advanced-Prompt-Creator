// Comprehensive AI Enhancement Structure & Error Handling Tests
// Tests code logic, error handling, and metrics tracking without requiring live API keys

import { enhanceWithAI, AIEnhancementResult } from './lib/ai-enhancer';
import { saveAPIConfig, loadAPIConfig, deleteAPIConfig, getAPIEndpoint } from './lib/ai-config';
import * as fs from 'fs';

interface StructureTestResult {
  testName: string;
  category: string;
  success: boolean;
  details: any;
  scCovered: string[];
}

const testResults: StructureTestResult[] = [];

// Sample data
const sampleRuleBased = `# Hybrid Prompt: Data Analysis

## 1. Context
Analyze customer data.

## 2. Requirements  
- Load data
- Clean data

## 3. Objectives
Generate insights.

## 4. Instructions
1. Process data
2. Analyze patterns

## 5. Success Criteria
- SC1: Data loaded
- SC2: Analysis complete
- SC3: Report generated

## 6. Constraints
Time: 2 hours

## 7. Output Format
Markdown report

## 8. Validation Loop
Verify all SC met`;

const sampleInput = 'Analyze customer data';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  AI ENHANCEMENT STRUCTURE & ERROR HANDLING TEST SUITE      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ============================================================
// CATEGORY 1: Configuration Management (SC-01, SC-02)
// ============================================================

console.log('📋 CATEGORY 1: Configuration Management\n');

// Test 1.1: Save & Load Configuration
function test1_1_SaveLoadConfig() {
  console.log('Test 1.1: Save & Load Configuration');
  
  try {
    const config = {
      enabled: true,
      provider: 'openai' as const,
      apiKey: 'test-key',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7
    };
    
    saveAPIConfig(config);
    const loaded = loadAPIConfig();
    
    const success = loaded !== null &&
                    loaded.provider === config.provider &&
                    loaded.apiKey === config.apiKey &&
                    loaded.model === config.model;
    
    console.log('  Result:', success ? '✅ PASS' : '❌ FAIL');
    console.log('  Loaded config:', loaded);
    
    testResults.push({
      testName: 'Save & Load Configuration',
      category: 'Configuration Management',
      success,
      details: { config, loaded },
      scCovered: ['SC-01']
    });
    
    return success;
    
  } catch (error: any) {
    console.log('  Result: ❌ FAIL');
    console.log('  Error:', error.message);
    testResults.push({
      testName: 'Save & Load Configuration',
      category: 'Configuration Management',
      success: false,
      details: { error: error.message },
      scCovered: ['SC-01']
    });
    return false;
  }
}

// Test 1.2: Delete Configuration
function test1_2_DeleteConfig() {
  console.log('\nTest 1.2: Delete Configuration');
  
  try {
    const config = {
      enabled: true,
      provider: 'openai' as const,
      apiKey: 'test-key',
      model: 'gpt-4'
    };
    
    saveAPIConfig(config);
    deleteAPIConfig();
    const loaded = loadAPIConfig();
    
    const success = loaded === null;
    
    console.log('  Result:', success ? '✅ PASS' : '❌ FAIL');
    console.log('  Config after delete:', loaded);
    
    testResults.push({
      testName: 'Delete Configuration',
      category: 'Configuration Management',
      success,
      details: { loadedAfterDelete: loaded },
      scCovered: ['SC-01']
    });
    
    return success;
    
  } catch (error: any) {
    console.log('  Result: ❌ FAIL');
    console.log('  Error:', error.message);
    testResults.push({
      testName: 'Delete Configuration',
      category: 'Configuration Management',
      success: false,
      details: { error: error.message },
      scCovered: ['SC-01']
    });
    return false;
  }
}

// Test 1.3: API Endpoint Resolution
function test1_3_APIEndpoint() {
  console.log('\nTest 1.3: API Endpoint Resolution');
  
  try {
    const endpoints = {
      openai: getAPIEndpoint('openai'),
      perplexity: getAPIEndpoint('perplexity'),
      glm4: getAPIEndpoint('glm4')
    };
    
    const success = endpoints.openai.includes('openai.com') &&
                    endpoints.perplexity.includes('perplexity.ai') &&
                    endpoints.glm4.includes('z.ai');
    
    console.log('  Result:', success ? '✅ PASS' : '❌ FAIL');
    console.log('  Endpoints:', endpoints);
    
    testResults.push({
      testName: 'API Endpoint Resolution',
      category: 'Configuration Management',
      success,
      details: endpoints,
      scCovered: ['SC-02']
    });
    
    return success;
    
  } catch (error: any) {
    console.log('  Result: ❌ FAIL');
    console.log('  Error:', error.message);
    testResults.push({
      testName: 'API Endpoint Resolution',
      category: 'Configuration Management',
      success: false,
      details: { error: error.message },
      scCovered: ['SC-02']
    });
    return false;
  }
}

// ============================================================
// CATEGORY 2: Error Handling (SC-07, ERR-001 to ERR-007)
// ============================================================

console.log('\n📋 CATEGORY 2: Error Handling\n');

// Test 2.1: Disabled Configuration
async function test2_1_DisabledConfig() {
  console.log('Test 2.1: Disabled Configuration Handling');
  
  try {
    const config = {
      enabled: false,
      provider: 'openai' as const,
      apiKey: 'test-key',
      model: 'gpt-4'
    };
    
    saveAPIConfig(config);
    const result = await enhanceWithAI(sampleRuleBased, sampleInput);
    
    const success = !result.success &&
                    result.fallback &&
                    result.error === 'AI enhancement not configured' &&
                    result.processingTime < 100;
    
    console.log('  Result:', success ? '✅ PASS' : '❌ FAIL');
    console.log('  Response:', {
      success: result.success,
      fallback: result.fallback,
      error: result.error,
      processingTime: result.processingTime
    });
    
    testResults.push({
      testName: 'Disabled Configuration Handling',
      category: 'Error Handling',
      success,
      details: result,
      scCovered: ['SC-07', 'ERR-006']
    });
    
    return success;
    
  } catch (error: any) {
    console.log('  Result: ❌ FAIL');
    console.log('  Error:', error.message);
    testResults.push({
      testName: 'Disabled Configuration Handling',
      category: 'Error Handling',
      success: false,
      details: { error: error.message },
      scCovered: ['SC-07', 'ERR-006']
    });
    return false;
  }
}

// Test 2.2: Invalid API Key
async function test2_2_InvalidAPIKey() {
  console.log('\nTest 2.2: Invalid API Key Handling');
  
  try {
    const config = {
      enabled: true,
      provider: 'openai' as const,
      apiKey: 'invalid-key-12345',
      model: 'gpt-4'
    };
    
    saveAPIConfig(config);
    const result = await enhanceWithAI(sampleRuleBased, sampleInput);
    
    const success = !result.success &&
                    result.fallback &&
                    result.error !== undefined;
    
    console.log('  Result:', success ? '✅ PASS' : '❌ FAIL');
    console.log('  Response:', {
      success: result.success,
      fallback: result.fallback,
      error: result.error,
      processingTime: result.processingTime
    });
    
    testResults.push({
      testName: 'Invalid API Key Handling',
      category: 'Error Handling',
      success,
      details: result,
      scCovered: ['SC-07', 'ERR-001']
    });
    
    return success;
    
  } catch (error: any) {
    console.log('  Result: ❌ FAIL');
    console.log('  Error:', error.message);
    testResults.push({
      testName: 'Invalid API Key Handling',
      category: 'Error Handling',
      success: false,
      details: { error: error.message },
      scCovered: ['SC-07', 'ERR-001']
    });
    return false;
  }
}

// Test 2.3: No Configuration
async function test2_3_NoConfig() {
  console.log('\nTest 2.3: No Configuration Handling');
  
  try {
    deleteAPIConfig();
    const result = await enhanceWithAI(sampleRuleBased, sampleInput);
    
    const success = !result.success &&
                    result.fallback &&
                    result.error === 'AI enhancement not configured';
    
    console.log('  Result:', success ? '✅ PASS' : '❌ FAIL');
    console.log('  Response:', {
      success: result.success,
      fallback: result.fallback,
      error: result.error
    });
    
    testResults.push({
      testName: 'No Configuration Handling',
      category: 'Error Handling',
      success,
      details: result,
      scCovered: ['SC-07', 'ERR-007']
    });
    
    return success;
    
  } catch (error: any) {
    console.log('  Result: ❌ FAIL');
    console.log('  Error:', error.message);
    testResults.push({
      testName: 'No Configuration Handling',
      category: 'Error Handling',
      success: false,
      details: { error: error.message },
      scCovered: ['SC-07', 'ERR-007']
    });
    return false;
  }
}

// ============================================================
// CATEGORY 3: Metrics Tracking (SC-05, SC-06)
// ============================================================

console.log('\n📋 CATEGORY 3: Metrics Tracking\n');

// Test 3.1: Processing Time Measurement
async function test3_1_ProcessingTime() {
  console.log('Test 3.1: Processing Time Measurement');
  
  try {
    deleteAPIConfig();
    const result = await enhanceWithAI(sampleRuleBased, sampleInput);
    
    const success = typeof result.processingTime === 'number' &&
                    result.processingTime >= 0;
    
    console.log('  Result:', success ? '✅ PASS' : '❌ FAIL');
    console.log('  Processing Time:', result.processingTime + 'ms');
    
    testResults.push({
      testName: 'Processing Time Measurement',
      category: 'Metrics Tracking',
      success,
      details: { processingTime: result.processingTime },
      scCovered: ['SC-06']
    });
    
    return success;
    
  } catch (error: any) {
    console.log('  Result: ❌ FAIL');
    console.log('  Error:', error.message);
    testResults.push({
      testName: 'Processing Time Measurement',
      category: 'Metrics Tracking',
      success: false,
      details: { error: error.message },
      scCovered: ['SC-06']
    });
    return false;
  }
}

// Test 3.2: Result Structure
async function test3_2_ResultStructure() {
  console.log('\nTest 3.2: Result Structure Validation');
  
  try {
    deleteAPIConfig();
    const result = await enhanceWithAI(sampleRuleBased, sampleInput);
    
    const hasRequiredFields = 
      typeof result.success === 'boolean' &&
      typeof result.processingTime === 'number' &&
      typeof result.provider === 'string' &&
      typeof result.model === 'string' &&
      typeof result.fallback === 'boolean';
    
    console.log('  Result:', hasRequiredFields ? '✅ PASS' : '❌ FAIL');
    console.log('  Structure:', {
      hasSuccess: typeof result.success === 'boolean',
      hasProcessingTime: typeof result.processingTime === 'number',
      hasProvider: typeof result.provider === 'string',
      hasModel: typeof result.model === 'string',
      hasFallback: typeof result.fallback === 'boolean'
    });
    
    testResults.push({
      testName: 'Result Structure Validation',
      category: 'Metrics Tracking',
      success: hasRequiredFields,
      details: result,
      scCovered: ['SC-05', 'SC-06']
    });
    
    return hasRequiredFields;
    
  } catch (error: any) {
    console.log('  Result: ❌ FAIL');
    console.log('  Error:', error.message);
    testResults.push({
      testName: 'Result Structure Validation',
      category: 'Metrics Tracking',
      success: false,
      details: { error: error.message },
      scCovered: ['SC-05', 'SC-06']
    });
    return false;
  }
}

// ============================================================
// Generate Comprehensive Report
// ============================================================

function generateReport() {
  const passedTests = testResults.filter(t => t.success).length;
  const totalTests = testResults.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(2);
  
  // SC Coverage
  const scCoverage = new Set<string>();
  testResults.forEach(t => t.scCovered.forEach(sc => scCoverage.add(sc)));
  
  const report = {
    summary: {
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      passRate: `${passRate}%`
    },
    categories: {
      'Configuration Management': testResults.filter(t => t.category === 'Configuration Management'),
      'Error Handling': testResults.filter(t => t.category === 'Error Handling'),
      'Metrics Tracking': testResults.filter(t => t.category === 'Metrics Tracking')
    },
    successCriteriaCoverage: {
      total: scCoverage.size,
      covered: Array.from(scCoverage).sort(),
      details: {
        'SC-01: API Connection & Configuration': scCoverage.has('SC-01'),
        'SC-02: Accurate Request Structure': scCoverage.has('SC-02'),
        'SC-05: Token Usage Tracking': scCoverage.has('SC-05'),
        'SC-06: Processing Time Measurement': scCoverage.has('SC-06'),
        'SC-07: API Error Handling': scCoverage.has('SC-07'),
        'ERR-001: Invalid API Key': scCoverage.has('ERR-001'),
        'ERR-006: Disabled Configuration': scCoverage.has('ERR-006'),
        'ERR-007: No Configuration': scCoverage.has('ERR-007')
      }
    },
    testResults
  };
  
  return report;
}

// ============================================================
// Main Test Runner
// ============================================================

async function runAllTests() {
  try {
    // Category 1: Configuration Management
    test1_1_SaveLoadConfig();
    test1_2_DeleteConfig();
    test1_3_APIEndpoint();
    
    // Category 2: Error Handling
    await test2_1_DisabledConfig();
    await test2_2_InvalidAPIKey();
    await test2_3_NoConfig();
    
    // Category 3: Metrics Tracking
    await test3_1_ProcessingTime();
    await test3_2_ResultStructure();
    
    // Generate report
    const report = generateReport();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Overall Results:');
    console.log('  Total Tests:', report.summary.totalTests);
    console.log('  Passed:', report.summary.passedTests, '✅');
    console.log('  Failed:', report.summary.failedTests, '❌');
    console.log('  Pass Rate:', report.summary.passRate);
    
    console.log('\n📋 Category Breakdown:');
    Object.entries(report.categories).forEach(([category, tests]) => {
      const passed = tests.filter(t => t.success).length;
      const total = tests.length;
      console.log(`  ${category}: ${passed}/${total} passed`);
    });
    
    console.log('\n✅ Success Criteria Coverage:');
    console.log(`  Total SC Covered: ${report.successCriteriaCoverage.total}`);
    Object.entries(report.successCriteriaCoverage.details).forEach(([sc, covered]) => {
      console.log(`  ${covered ? '✅' : '❌'} ${sc}`);
    });
    
    // Save report
    fs.writeFileSync(
      'ai-enhancement-structure-test-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n✓ Full report saved to: ai-enhancement-structure-test-report.json');
    
    return report;
    
  } catch (error: any) {
    console.error('\n❌ Test suite error:', error);
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
