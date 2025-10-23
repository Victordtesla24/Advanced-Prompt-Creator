
// Test script for API connection testing
// Run with: npx tsx test-api-connection.ts

import { testAPIConnection } from './lib/ai-config';

async function runTests() {
  console.log('🧪 Starting API Connection Tests\n');
  console.log('=' .repeat(60));
  
  const openaiKey = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';
  const perplexityKey = process.env.PERPLEXITY_API_KEY || 'your-perplexity-api-key-here';
  
  // Test 1: Valid OpenAI key (trying gpt-4o-mini for lower rate limits)
  console.log('\n📝 TEST 1: OpenAI with Valid Key (gpt-4o-mini)');
  console.log('-'.repeat(60));
  try {
    const result1 = await testAPIConnection('openai', openaiKey, 'gpt-4o-mini');
    console.log('Status:', result1.success ? '✅ PASS' : '❌ FAIL');
    console.log('Message:', result1.message);
    console.log('Latency:', result1.latency ? `${result1.latency}ms` : 'N/A');
    console.log('Expected: Success with latency < 3000ms');
    console.log('Result:', result1.success && (result1.latency || 0) < 3000 ? '✅ PASS' : '❌ FAIL');
  } catch (error: any) {
    console.log('❌ ERROR:', error.message);
  }
  
  // Test 2: Valid Perplexity key (using updated model name)
  console.log('\n📝 TEST 2: Perplexity with Valid Key (sonar-pro)');
  console.log('-'.repeat(60));
  try {
    const result2 = await testAPIConnection('perplexity', perplexityKey, 'sonar-pro');
    console.log('Status:', result2.success ? '✅ PASS' : '❌ FAIL');
    console.log('Message:', result2.message);
    console.log('Latency:', result2.latency ? `${result2.latency}ms` : 'N/A');
    console.log('Expected: Success with latency < 3000ms');
    console.log('Result:', result2.success && (result2.latency || 0) < 3000 ? '✅ PASS' : '❌ FAIL');
  } catch (error: any) {
    console.log('❌ ERROR:', error.message);
  }
  
  // Test 3: Invalid OpenAI key
  console.log('\n📝 TEST 3: OpenAI with Invalid Key');
  console.log('-'.repeat(60));
  try {
    const result3 = await testAPIConnection('openai', 'sk-invalid-key', 'gpt-4');
    console.log('Status:', !result3.success ? '✅ PASS (Expected Failure)' : '❌ FAIL (Should have failed)');
    console.log('Message:', result3.message);
    console.log('Latency:', result3.latency ? `${result3.latency}ms` : 'N/A');
    console.log('Expected: Error "Invalid API key"');
    console.log('Result:', !result3.success && result3.message.includes('Invalid API key') ? '✅ PASS' : '❌ FAIL');
  } catch (error: any) {
    console.log('❌ ERROR:', error.message);
  }
  
  // Test 4: Invalid Perplexity key (using updated model name)
  console.log('\n📝 TEST 4: Perplexity with Invalid Key');
  console.log('-'.repeat(60));
  try {
    const result4 = await testAPIConnection('perplexity', 'pplx-invalid-key', 'sonar-pro');
    console.log('Status:', !result4.success ? '✅ PASS (Expected Failure)' : '❌ FAIL (Should have failed)');
    console.log('Message:', result4.message);
    console.log('Latency:', result4.latency ? `${result4.latency}ms` : 'N/A');
    console.log('Expected: Error "Invalid API key"');
    console.log('Result:', !result4.success && result4.message.includes('Invalid API key') ? '✅ PASS' : '❌ FAIL');
  } catch (error: any) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 API Connection Tests Complete\n');
}

// Run tests
runTests().catch(console.error);
