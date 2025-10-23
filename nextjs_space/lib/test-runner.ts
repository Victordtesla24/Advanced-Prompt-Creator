
interface TestResult {
  test_name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
}

interface TestSummary {
  total_tests: number;
  passed: number;
  failed: number;
  success_rate: number;
  overall_status: string;
  detailed_results: TestResult[];
}

export async function runValidationTests(
  hybridPrompt: string, 
  originalInput: string
): Promise<TestSummary> {
  const testResults: TestResult[] = []
  
  // Test 1: Input Integrity Preservation
  testResults.push(testIntegrityPreservation(hybridPrompt, originalInput))
  
  // Test 2: Structure Compliance
  testResults.push(testStructureCompliance(hybridPrompt))
  
  // Test 3: Validation Loop Implementation
  testResults.push(testValidationLoopPresence(hybridPrompt))
  
  // Test 4: Success Criteria Extraction
  testResults.push(testSuccessCriteriaExtraction(hybridPrompt, originalInput))
  
  // Test 5: Token Efficiency
  testResults.push(testTokenEfficiency(hybridPrompt, originalInput))
  
  // Test 6: Engineering Techniques Applied
  testResults.push(testEngineeringTechniques(hybridPrompt))
  
  // Test 7: No Unwarranted Changes
  testResults.push(testNoUnwarrantedChanges(hybridPrompt, originalInput))
  
  // Calculate summary
  const totalTests = testResults.length
  const passedTests = testResults.filter(r => r.status === 'PASS').length
  const failedTests = totalTests - passedTests
  const successRate = Math.round((passedTests / totalTests) * 100 * 10) / 10
  
  let overallStatus = 'FAIL'
  if (passedTests === totalTests) {
    overallStatus = 'PASS'
  } else if (passedTests > totalTests / 2) {
    overallStatus = 'PARTIAL PASS'
  }
  
  return {
    total_tests: totalTests,
    passed: passedTests,
    failed: failedTests,
    success_rate: successRate,
    overall_status: overallStatus,
    detailed_results: testResults
  }
}

function testIntegrityPreservation(hybridPrompt: string, originalInput: string): TestResult {
  const originalKeywords = new Set(
    originalInput.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
  )
  const hybridKeywords = new Set(
    hybridPrompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
  )
  
  const intersectionSize = [...originalKeywords].filter(word => hybridKeywords.has(word)).length
  const preservationRatio = intersectionSize / originalKeywords.size
  const preservationPercentage = Math.round(preservationRatio * 100 * 10) / 10
  
  return {
    test_name: 'Input Integrity Preservation',
    expected: '≥85% keyword preservation',
    actual: `${preservationPercentage}% keywords preserved`,
    status: preservationRatio >= 0.85 ? 'PASS' : 'FAIL'
  }
}

function testStructureCompliance(hybridPrompt: string): TestResult {
  const requiredSections = [
    'context', 
    'requirements', 
    'role',
    'objectives', 
    'instructions', 
    'success criteria',
    'constraints',
    'validation loop',
    'output format'
  ]
  
  const lowerPrompt = hybridPrompt.toLowerCase()
  const foundSections = requiredSections.filter(section =>
    lowerPrompt.includes(section.toLowerCase())
  )
  
  const complianceRate = foundSections.length / requiredSections.length
  
  return {
    test_name: 'Structure Compliance',
    expected: 'All 9 required sections present',
    actual: `${foundSections.length}/${requiredSections.length} sections found`,
    status: complianceRate === 1.0 ? 'PASS' : 'FAIL'
  }
}

function testValidationLoopPresence(hybridPrompt: string): TestResult {
  // Required loop indicators based on requirements
  const requiredIndicators = [
    'VALIDATION_LOOP',
    'FOR each',
    'IF',
    'REGENERATE',
    'REPEAT',
    'MARK',
    'COMPLETE'
  ]
  
  const lowerPrompt = hybridPrompt.toLowerCase()
  const upperPrompt = hybridPrompt.toUpperCase()
  
  const foundIndicators = requiredIndicators.filter(indicator => {
    const lowerIndicator = indicator.toLowerCase()
    const upperIndicator = indicator.toUpperCase()
    return lowerPrompt.includes(lowerIndicator) || upperPrompt.includes(upperIndicator)
  })
  
  const loopPresent = foundIndicators.length >= 4
  
  return {
    test_name: 'Validation Loop Implementation',
    expected: '≥4 loop indicators',
    actual: `${foundIndicators.length} indicators found`,
    status: loopPresent ? 'PASS' : 'FAIL'
  }
}

function testSuccessCriteriaExtraction(hybridPrompt: string, originalInput: string): TestResult {
  const hybridScCount = (hybridPrompt.toLowerCase().match(/sc\d+|success criter/g) || []).length
  const originalScCount = (originalInput.toLowerCase().match(/sc\d+|success criter/g) || []).length
  
  const scPresent = hybridScCount > 0
  const adequateExtraction = hybridScCount >= Math.max(originalScCount, 1)
  
  return {
    test_name: 'Success Criteria Extraction',
    expected: 'All SCs from input identified',
    actual: `${hybridScCount} SC references found`,
    status: scPresent && adequateExtraction ? 'PASS' : 'FAIL'
  }
}

function testTokenEfficiency(hybridPrompt: string, originalInput: string): TestResult {
  const originalTokens = originalInput.split(/\s+/).length
  const hybridTokens = hybridPrompt.split(/\s+/).length
  
  const tokenRatio = hybridTokens / originalTokens
  const isEfficient = tokenRatio < 3.0
  
  // Show more precision in display
  const displayRatio = Math.round(tokenRatio * 100) / 100
  
  return {
    test_name: 'Token Efficiency',
    expected: 'Reasonable token expansion (<3x)',
    actual: `${displayRatio}x expansion`,
    status: isEfficient ? 'PASS' : 'FAIL'
  }
}

function testEngineeringTechniques(hybridPrompt: string): TestResult {
  // Check for explicit technique labels and patterns
  const techniquePatterns = [
    { name: 'Chain-of-Thought', patterns: ['[Chain-of-Thought', 'Step 1:', 'Step 2:', 'Then:', 'Finally:'] },
    { name: 'Role Prompting', patterns: ['[Role Prompting', 'Act as', 'You are'] },
    { name: 'Tree-of-Thoughts', patterns: ['[Tree-of-Thoughts', 'Alternative', 'Option', 'Branch'] },
    { name: 'Generate-Knowledge', patterns: ['[Generate-Knowledge', 'Context:', 'Background:', 'Domain:'] },
    { name: 'Decomposition', patterns: ['[Decomposition', 'Subtask', 'Break down', 'Component'] },
    { name: 'Recursive Validation', patterns: ['Validation Loop', 'VALIDATION_LOOP', 'recursive'] }
  ]
  
  const lowerPrompt = hybridPrompt.toLowerCase()
  const foundTechniques: string[] = []
  
  techniquePatterns.forEach(({ name, patterns }) => {
    const hasPattern = patterns.some(pattern => 
      lowerPrompt.includes(pattern.toLowerCase()) || hybridPrompt.includes(pattern)
    )
    if (hasPattern && !foundTechniques.includes(name)) {
      foundTechniques.push(name)
    }
  })
  
  const techniquesApplied = foundTechniques.length >= 2
  
  return {
    test_name: 'Engineering Techniques Applied',
    expected: '≥2 techniques',
    actual: `${foundTechniques.length} techniques: ${foundTechniques.join(', ') || 'none'}`,
    status: techniquesApplied ? 'PASS' : 'FAIL'
  }
}

function testNoUnwarrantedChanges(hybridPrompt: string, originalInput: string): TestResult {
  const originalSentences = originalInput.split(/[.!?]+/).filter(s => s.trim().length > 10)
  let preservationCount = 0
  
  originalSentences.forEach(sentence => {
    const keyWords = sentence.split(/\s+/).filter(word => word.length > 4)
    const hasKeyWords = keyWords.some(word => 
      hybridPrompt.toLowerCase().includes(word.toLowerCase())
    )
    if (hasKeyWords) {
      preservationCount++
    }
  })
  
  const preservationRate = originalSentences.length > 0 
    ? preservationCount / originalSentences.length 
    : 1
  const preservationPercentage = Math.round(preservationRate * 100 * 10) / 10
  
  return {
    test_name: 'No Unwarranted Changes',
    expected: '≥70% content preservation',
    actual: `${preservationPercentage}% content preserved`,
    status: preservationRate >= 0.7 ? 'PASS' : 'FAIL'
  }
}
