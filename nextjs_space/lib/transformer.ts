

interface TransformationResult {
  transformed_prompt: string;
  process_details: {
    original_analysis: any;
    sc_extraction: string[];
    validation_log: string[];
    structure_compliance: any;
    token_metrics: any;
    techniques_applied: string[];
  };
}

interface TransformationOptions {
  max_iterations?: number;
  include_details?: boolean;
  mode?: 'minimal' | 'standard' | 'comprehensive';
  file_context?: string; // NEW: Optional file context from uploaded files
  char_limit?: number;   // NEW: Optional character limit
}

export async function transformPrompt(
  inputText: string, 
  options: TransformationOptions = {}
): Promise<TransformationResult> {
  const { max_iterations = 5, include_details = true, file_context, char_limit } = options
  
  // NEW: Enhance input with file context if provided
  let enhancedInput = inputText
  if (file_context) {
    enhancedInput = `${inputText}${file_context}`
  }
  
  // Step 1: Input Prompt Analysis
  const originalAnalysis = analyzeInputPrompt(enhancedInput)
  
  // Step 1.5: Extract Success Criteria (Always 10 SCs)
  const successCriteria = extractTenSuccessCriteria(inputText, originalAnalysis)
  originalAnalysis.successCriteria = successCriteria
  
  // Step 2: Apply Prompt Engineering Techniques with ALL sections
  const techniquesApplied: string[] = []
  let transformedPrompt = applyComprehensivePromptEngineering(inputText, originalAnalysis, techniquesApplied)
  
  // Step 3: Execute Proper Recursive Validation Loop
  const validationLog: string[] = []
  let iterations = 0
  let allCriteriaMet = false
  
  validationLog.push(`Start validation (max ${max_iterations})`)
  
  while (!allCriteriaMet && iterations < max_iterations) {
    iterations++
    validationLog.push(`Iter ${iterations}: Checking SCs`)
    
    const validationResults = validateSuccessCriteria(transformedPrompt, inputText, originalAnalysis)
    
    if (validationResults.allMet) {
      allCriteriaMet = true
      validationLog.push(`Iter ${iterations}: ✓ All met`)
    } else {
      validationLog.push(`Iter ${iterations}: ${validationResults.unmetCriteria.length} unmet`)
      
      // Regenerate to address unmet criteria
      transformedPrompt = refinePrompt(transformedPrompt, validationResults.unmetCriteria, techniquesApplied, inputText, originalAnalysis)
      
      validationLog.push(`Iter ${iterations}: Regenerated`)
    }
  }
  
  if (allCriteriaMet) {
    validationLog.push(`✓ Complete (${iterations} iters)`)
  } else {
    validationLog.push(`⚠ Max reached (${iterations})`)
  }
  
  // Step 4: Check token metrics (no optimization needed - already minimal)
  const tokenMetrics = calculateTokenMetrics(inputText, transformedPrompt)
  validationLog.push(`Token metrics: ${tokenMetrics.expansion_ratio}x`)
  
  // NEW: Apply character limit if specified
  if (char_limit && char_limit > 0) {
    if (transformedPrompt.length > char_limit) {
      transformedPrompt = enforceCharacterLimit(transformedPrompt, char_limit)
      validationLog.push(`Character limit enforced: ${char_limit}`)
    }
  }
  
  // Step 5: Gather process details
  const processDetails = {
    original_analysis: originalAnalysis,
    sc_extraction: successCriteria,
    validation_log: validationLog,
    structure_compliance: checkStructureCompliance(transformedPrompt),
    token_metrics: calculateTokenMetrics(inputText, transformedPrompt),
    techniques_applied: techniquesApplied
  }
  
  return {
    transformed_prompt: transformedPrompt,
    process_details: processDetails
  }
}

// CRITICAL FIX: Extract intelligent, specific Success Criteria
function extractTenSuccessCriteria(inputText: string, analysis: any): string[] {
  const inputWords = inputText.split(/\s+/).filter(w => w.trim()).length
  
  // Extract explicit SCs from input
  const explicitSCs: string[] = []
  const scPatterns = [
    /(?:SC|success\s*criteria?)\s*(\d+)\s*[:]\s*([^\n]+)/gi,
    /[-•]\s*(?:SC|success\s*criteria?)\s*[:]\s*([^\n]+)/gi
  ]
  
  scPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(inputText)) !== null) {
      const sc = (match[2] || match[1])?.trim()
      if (sc && sc.length > 5 && !explicitSCs.includes(sc)) {
        explicitSCs.push(sc)
      }
    }
  })
  
  // Return explicit if found
  if (explicitSCs.length >= 3) {
    return explicitSCs.slice(0, 10)
  }
  
  // Generate intelligent, specific SCs based on input content
  const specificSCs: string[] = []
  
  // Extract key requirements from input
  const requirements = extractKeyRequirements(inputText)
  
  // SC1: Always check original text preservation
  specificSCs.push("Original text preserved (no additions/removals)")
  
  // SC2: Completeness check based on extracted requirements
  if (requirements.length > 0) {
    specificSCs.push(`All ${requirements.length} requirements addressed`)
  } else {
    specificSCs.push("All input requirements addressed")
  }
  
  // SC3: Domain-specific quality
  const domain = inferDomain(inputText)
  specificSCs.push(`${domain}-appropriate content and terminology`)
  
  // SC4: Structure and clarity
  specificSCs.push("Clear structure with logical flow")
  
  // SC5: Actionability
  specificSCs.push("Actionable outputs with specific guidance")
  
  // SC6: Token efficiency
  specificSCs.push("Token expansion ratio <3x")
  
  // Add more specific SCs if input is complex
  if (inputWords > 50) {
    specificSCs.push("Detailed context and scenario description")
    specificSCs.push("Comprehensive task decomposition")
  }
  
  // Fill remaining slots with quality measures
  if (specificSCs.length < 6) {
    specificSCs.push("Professional quality and presentation")
    specificSCs.push("Validation loop completeness")
  }
  
  return specificSCs.slice(0, 10)
}

// Helper function to extract key requirements
function extractKeyRequirements(inputText: string): string[] {
  const requirements: string[] = []
  const patterns = [
    /(?:must|should|need[s]?|require[sd]?|include)\s+([^.!?\n]+)/gi,
    /[-•]\s*([^.!?\n]+)/gi
  ]
  
  patterns.forEach(pattern => {
    let match
    const text = inputText
    const regex = new RegExp(pattern.source, pattern.flags)
    while ((match = regex.exec(text)) !== null) {
      const req = match[1]?.trim()
      if (req && req.length > 10 && req.length < 100) {
        requirements.push(req)
      }
    }
  })
  
  return requirements.slice(0, 10)
}

// CRITICAL FIX: Enhanced prompt engineering with ADAPTIVE token efficiency (<3x expansion)
function applyComprehensivePromptEngineering(
  inputText: string,
  analysis: any,
  techniquesApplied: string[]
): string {
  let prompt = ''
  const inputWords = inputText.split(/\s+/).filter(w => w.trim()).length
  const domain = inferDomain(inputText)
  
  // ADAPTIVE MODE SELECTION for token efficiency
  const isShort = inputWords <= 20    // Target <2.5x expansion
  const isMedium = inputWords > 20 && inputWords <= 100  // Target <2x expansion
  const isLong = inputWords > 100     // Target <1.5x expansion
  
  const parts: string[] = []
  
  // MODE 1: MINIMAL (for short inputs - target <2.5x expansion)
  if (isShort) {
    // Ultra-concise structure for short inputs
    parts.push(`# Context\n${domain} task`)
    techniquesApplied.push('Generate-Knowledge')
    
    parts.push(`# Requirements\n${inputText}`)
    
    parts.push(`# Role\nExpert ${domain} specialist`)
    techniquesApplied.push('Role Prompting')
    
    parts.push(`# Objectives\nExecute requirements with precision`)
    
    parts.push(`# Instructions\n1. Parse requirements\n2. Execute task\n3. Validate quality`)
    techniquesApplied.push('Chain-of-Thought (CoT)')
    
    // Condensed Success Criteria (max 5 for short inputs)
    const condensedSCs = analysis.successCriteria.slice(0, 5)
    const scLines = condensedSCs.map((sc: string, i: number) => `SC${i + 1}: ${sc}`)
    parts.push(`# Success Criteria\n${scLines.join('\n')}`)
    
    parts.push(`# Constraints\nMaintain original requirements`)
    
    parts.push(`# Validation\nVerify all SCs met`)
    techniquesApplied.push('Recursive Validation')
    
    parts.push(`# Output\nMarkdown format`)
    
    prompt = parts.join('\n\n')
    return prompt
  }
  
  // MODE 2: STANDARD (for medium inputs - target <2x expansion)
  if (isMedium) {
    const contextDescription = generateEnhancedContext(inputText, domain, analysis)
    parts.push(`# Context\n${contextDescription}`)
    techniquesApplied.push('Generate-Knowledge')
    
    parts.push(`# Requirements\n${inputText}`)
    
    const roleDescription = generateDetailedRole(inputText, domain)
    parts.push(`# Role\n${roleDescription}`)
    techniquesApplied.push('Role Prompting')
    
    parts.push(`# Objectives\nDeliver high-quality outputs meeting all requirements`)
    
    const detailedTasks = generateDetailedTasks(inputText, analysis, domain)
    parts.push(`# Instructions\n${detailedTasks}`)
    techniquesApplied.push('Chain-of-Thought (CoT)')
    techniquesApplied.push('Tree-of-Thoughts')
    
    // Standard SCs (max 7 for medium inputs)
    const standardSCs = analysis.successCriteria.slice(0, 7)
    const scLines = standardSCs.map((sc: string, i: number) => `**SC${i + 1}:** ${sc}`)
    parts.push(`# Success Criteria\n${scLines.join('\n')}`)
    
    parts.push(`# Constraints\nMaintain fidelity to requirements`)
    
    parts.push(`# Validation\nIterative validation: check each SC, regenerate if needed, ensure 100% completion`)
    techniquesApplied.push('Recursive Validation')
    
    parts.push(`# Output\nMarkdown with clear sections`)
    
    prompt = parts.join('\n\n')
    return prompt
  }
  
  // MODE 3: COMPREHENSIVE (for long inputs - target <1.5x expansion)
  // Full structure with all details (existing comprehensive approach)
  const contextDescription = generateEnhancedContext(inputText, domain, analysis)
  parts.push(`# Context\n${contextDescription}`)
  techniquesApplied.push('Generate-Knowledge')
  
  parts.push(`# Requirements Analysis\n${inputText}`)
  
  const roleDescription = generateDetailedRole(inputText, domain)
  parts.push(`# Role [Role Prompting]\n${roleDescription}`)
  techniquesApplied.push('Role Prompting')
  
  const objectives = generateObjectives(inputText, analysis)
  parts.push(`# Objectives\n${objectives}`)
  
  const detailedTasks = generateDetailedTasks(inputText, analysis, domain)
  parts.push(`# Instructions/Tasks [CoT + ToT]\n${detailedTasks}`)
  techniquesApplied.push('Chain-of-Thought (CoT)')
  techniquesApplied.push('Tree-of-Thoughts')
  techniquesApplied.push('Decomposition')
  
  // All SCs for long inputs (max 10)
  const scLines = analysis.successCriteria.map((sc: string, i: number) => `**SC${i + 1}:** ${sc}`)
  parts.push(`# Success Criteria\n${scLines.join('\n')}`)
  
  parts.push(`# Constraints\nMaintain fidelity to original requirements`)
  
  parts.push(`# Validation Loop\n\`\`\`\nFOR each SC:\n  IF NOT met:\n    Regenerate\n    Revalidate\n  MARK complete\nENSURE 100% completion\n\`\`\``)
  techniquesApplied.push('Recursive Validation')
  
  parts.push(`# Output Format\nMarkdown with clear sections`)
  
  prompt = parts.join('\n\n')
  
  return prompt
}

// Generate enhanced context with intelligent domain analysis
function generateEnhancedContext(inputText: string, domain: string, analysis: any): string {
  const inputWords = inputText.split(/\s+/).filter(w => w.trim()).length
  
  // Short input: concise context
  if (inputWords <= 20) {
    return `Domain: ${domain}\nTask: Focused execution with quality validation`
  }
  
  // Analyze input for scenario details
  const hasBusinessTerms = /market|strategy|customer|revenue|business|plan/i.test(inputText)
  const hasTechTerms = /code|api|software|system|database|develop/i.test(inputText)
  const hasTargetAudience = /target|audience|user|customer|demographic/i.test(inputText)
  const hasMetrics = /metric|kpi|measure|track|data|analytics/i.test(inputText)
  
  let scenario = ''
  
  if (domain === 'Business') {
    scenario = hasBusinessTerms && hasTargetAudience 
      ? 'Strategic business planning with target audience analysis and market positioning'
      : 'Business strategy development with data-driven decision making'
  } else if (domain === 'Technology') {
    scenario = hasTechTerms 
      ? 'Technical system design and development with best practices implementation'
      : 'Technology solution architecture and implementation'
  } else if (domain === 'Creative') {
    scenario = 'Creative content development with audience engagement focus'
  } else if (domain === 'Analysis') {
    scenario = hasMetrics 
      ? 'Data-driven analysis with comprehensive metrics and insights'
      : 'Systematic research and analytical evaluation'
  } else {
    scenario = 'Comprehensive task execution with quality assurance'
  }
  
  return `Domain: ${domain}\nScenario: ${scenario}\nApproach: Systematic methodology with validation`
}

// Generate detailed role with specific expertise
function generateDetailedRole(inputText: string, domain: string): string {
  const roleMap: Record<string, string> = {
    'Business': 'You are a Senior Business Strategist with expertise in market analysis, competitive positioning, and strategic planning. Apply data-driven insights and proven frameworks.',
    'Technology': 'You are a Senior Technical Architect with expertise in system design, software development, and best practices. Ensure scalable, maintainable solutions.',
    'Education': 'You are an Expert Educator with deep knowledge of pedagogy, learning outcomes, and curriculum design. Focus on clear, engaging instruction.',
    'Creative': 'You are a Professional Content Creator with expertise in storytelling, audience engagement, and brand voice. Deliver compelling, original content.',
    'Analysis': 'You are a Senior Analyst with expertise in research methodology, data analysis, and evidence-based conclusions. Provide thorough, objective insights.',
    'General': 'You are an Expert Specialist with comprehensive knowledge and proven methodologies. Deliver professional, high-quality outputs.'
  }
  
  return roleMap[domain] || roleMap['General']
}

// Generate clear objectives
function generateObjectives(inputText: string, analysis: any): string {
  const requirements = analysis.requirements || []
  if (requirements.length > 0) {
    return `Execute all specified requirements with precision and quality assurance`
  }
  return `Complete the task as specified with comprehensive validation`
}

// Generate detailed task decomposition
function generateDetailedTasks(inputText: string, analysis: any, domain: string): string {
  const inputWords = inputText.split(/\s+/).filter(w => w.trim()).length
  const lowerInput = inputText.toLowerCase()
  
  // For short inputs, keep it concise
  if (inputWords <= 20) {
    return `**Task 1:** Parse and analyze input requirements\n**Task 2:** Execute per specifications\n**Task 3:** Validate against success criteria`
  }
  
  // For medium/long inputs, generate detailed task breakdown
  const tasks: string[] = []
  
  // Phase 1: Analysis
  tasks.push(`**Phase 1: Analysis & Planning**`)
  tasks.push(`- Task 1.1: Analyze input requirements and extract key objectives`)
  
  if (lowerInput.includes('market') || lowerInput.includes('audience') || lowerInput.includes('customer')) {
    tasks.push(`- Task 1.2: Identify target audience and market context`)
  }
  
  // Phase 2: Execution
  tasks.push(`\n**Phase 2: Execution**`)
  
  if (lowerInput.includes('create') || lowerInput.includes('develop') || lowerInput.includes('design')) {
    tasks.push(`- Task 2.1: Develop solution framework and structure`)
    tasks.push(`- Task 2.2: Create detailed content addressing all requirements`)
  } else if (lowerInput.includes('analyze') || lowerInput.includes('evaluate') || lowerInput.includes('assess')) {
    tasks.push(`- Task 2.1: Conduct systematic analysis of relevant factors`)
    tasks.push(`- Task 2.2: Evaluate findings and derive insights`)
  } else {
    tasks.push(`- Task 2.1: Execute primary task objectives`)
    tasks.push(`- Task 2.2: Ensure comprehensive coverage of all requirements`)
  }
  
  // Phase 3: Validation
  tasks.push(`\n**Phase 3: Validation & Quality Assurance**`)
  tasks.push(`- Task 3.1: Validate outputs against success criteria`)
  tasks.push(`- Task 3.2: Refine and optimize for quality`)
  
  return tasks.join('\n')
}

function analyzeInputPrompt(inputText: string) {
  const lines = inputText.split('\n').filter(line => line.trim())
  const words = inputText.split(/\s+/).filter(w => w.trim())
  const sentences = inputText.split(/[.!?]+/).filter(s => s.trim())
  
  // Extract Success Criteria
  const successCriteria: string[] = []
  const scRegex = /(success\s*criteria?\s*\d*|sc\s*\d+)\s*[:]\s*(.+)/gi
  let match
  while ((match = scRegex.exec(inputText)) !== null) {
    successCriteria.push(match[2]?.trim() || match[0])
  }
  
  // Extract requirements
  const requirements: string[] = []
  const reqPatterns = [
    /require[sd]?\s*[:]\s*(.+)/gi,
    /must\s+(.+)/gi,
    /should\s+(.+)/gi,
    /need[s]?\s+to\s+(.+)/gi,
    /include\s+(.+)/gi
  ]
  
  reqPatterns.forEach(pattern => {
    let reqMatch
    const resetPattern = new RegExp(pattern.source, pattern.flags)
    while ((reqMatch = resetPattern.exec(inputText)) !== null) {
      const extracted = reqMatch[1]?.trim()
      if (extracted && extracted.length > 0) {
        requirements.push(extracted)
      }
    }
  })
  
  // Extract objectives
  const objectives: string[] = []
  const objPatterns = [
    /objective[s]?\s*[:]\s*(.+)/gi,
    /goal[s]?\s*[:]\s*(.+)/gi,
    /aim[s]?\s*[:]\s*(.+)/gi
  ]
  
  objPatterns.forEach(pattern => {
    let objMatch
    const resetPattern = new RegExp(pattern.source, pattern.flags)
    while ((objMatch = resetPattern.exec(inputText)) !== null) {
      const extracted = objMatch[1]?.trim()
      if (extracted && extracted.length > 0) {
        objectives.push(extracted)
      }
    }
  })
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    lineCount: lines.length,
    successCriteria,
    requirements,
    objectives,
    complexity: calculateComplexity(inputText)
  }
}

function calculateComplexity(text: string): number {
  const words = text.split(/\s+/).filter(w => w.trim())
  if (words.length === 0) return 0
  
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim())
  const avgSentenceLength = words.length / Math.max(sentences.length, 1)
  
  // Simple complexity score (0-100)
  return Math.min(100, Math.round((avgWordLength * 5) + (avgSentenceLength * 2)))
}



function inferDomain(inputText: string): string {
  const domainKeywords = [
    { domain: 'Business', keywords: ['business', 'strategy', 'market', 'revenue', 'profit', 'customer', 'plan'] },
    { domain: 'Technology', keywords: ['code', 'software', 'api', 'database', 'programming', 'system', 'develop'] },
    { domain: 'Education', keywords: ['learn', 'teach', 'course', 'student', 'education', 'training'] },
    { domain: 'Creative', keywords: ['write', 'create', 'design', 'story', 'content', 'creative'] },
    { domain: 'Analysis', keywords: ['analyze', 'research', 'data', 'report', 'study', 'investigate'] }
  ]
  
  const lowerText = inputText.toLowerCase()
  let bestMatch = { domain: 'General', score: 0 }
  
  domainKeywords.forEach(({ domain, keywords }) => {
    const score = keywords.reduce((count, keyword) => {
      return count + (lowerText.includes(keyword) ? 1 : 0)
    }, 0)
    
    if (score > bestMatch.score) {
      bestMatch = { domain, score }
    }
  })
  
  return bestMatch.domain
}

// UPDATED: Ultra-concise task decomposition for Chain-of-Thought
function decomposeIntoDetailedTasks(inputText: string, analysis: any): string[] {
  const tasks: string[] = []
  const lowerInput = inputText.toLowerCase()
  
  // Task decomposition based on input type (ultra-concise)
  if (lowerInput.includes('create') || lowerInput.includes('generate') || lowerInput.includes('write')) {
    tasks.push('Parse input')
    tasks.push('Create content')
    tasks.push('Validate')
  } else if (lowerInput.includes('analyze') || lowerInput.includes('evaluate') || lowerInput.includes('assess')) {
    tasks.push('Examine')
    tasks.push('Analyze')
    tasks.push('Validate')
  } else {
    tasks.push('Process')
    tasks.push('Execute')
    tasks.push('Validate')
  }
  
  return tasks
}

// NEW: Generate scenario description
function generateScenarioDescription(inputText: string): string {
  if (inputText.length < 50) {
    return 'Focused task execution with quality validation'
  }
  return 'Advanced prompt transformation with comprehensive validation and optimization'
}

// NEW: Generate domain-specific knowledge
function generateDomainKnowledge(inputText: string): string {
  const domain = inferDomain(inputText)
  const knowledgeMap: Record<string, string> = {
    'Business & Strategy': 'Effective business strategies require data-driven analysis, market understanding, and strategic foresight.',
    'Technology & Development': 'Modern software development emphasizes best practices, code quality, scalability, and maintainability.',
    'Education & Training': 'Quality educational content requires clear structure, engagement strategies, and measurable learning outcomes.',
    'Creative & Content': 'Professional content creation balances creativity with audience needs, SEO considerations, and brand voice.',
    'Analysis & Research': 'Rigorous research methodology includes systematic data collection, objective analysis, and evidence-based conclusions.',
    'General': 'Quality output requires systematic approach, attention to detail, and validation against success criteria.'
  }
  
  return knowledgeMap[domain] || knowledgeMap['General']
}

// NEW: Get role for domain - ULTRA MINIMAL
function getRoleForDomain(inputText: string): string {
  const domain = inferDomain(inputText)
  const roleMap: Record<string, string> = {
    'Business': 'strategist',
    'Technology': 'architect',
    'Education': 'educator',
    'Creative': 'writer',
    'Analysis': 'analyst'
  }
  
  return roleMap[domain] || 'specialist'
}

// NEW: Get domain-specific expertise
function getDomainSpecificExpertise(inputText: string): string {
  const domain = inferDomain(inputText)
  const expertiseMap: Record<string, string> = {
    'Business & Strategy': 'strategic planning, market analysis, and business optimization',
    'Technology & Development': 'software architecture, code optimization, and technical best practices',
    'Education & Training': 'curriculum development, learning theory, and instructional methodology',
    'Creative & Content': 'content strategy, audience engagement, and creative storytelling',
    'Analysis & Research': 'research methodology, statistical analysis, and data interpretation',
    'General': 'systematic problem-solving and quality assurance'
  }
  
  return expertiseMap[domain] || expertiseMap['General']
}

// NEW: Infer objectives from input (CONCISE)
function inferObjectives(inputText: string): string[] {
  const objectives: string[] = []
  const lowerInput = inputText.toLowerCase()
  
  if (lowerInput.includes('comprehensive') || lowerInput.includes('detailed')) {
    objectives.push('Deliver detailed results')
  } else {
    objectives.push('Execute requirements')
  }
  
  objectives.push('Validate output quality')
  
  return objectives.slice(0, 2)
}

// NEW: Extract or generate constraints
function extractOrGenerateConstraints(inputText: string): string[] {
  const constraints: string[] = []
  
  // Try to extract explicit constraints
  const constraintPatterns = [
    /constraint[s]?\s*[:]\s*([^\n]+)/gi,
    /must not\s+([^\n]+)/gi,
    /cannot\s+([^\n]+)/gi,
    /avoid\s+([^\n]+)/gi
  ]
  
  constraintPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(inputText)) !== null) {
      const constraint = match[1]?.trim()
      if (constraint && constraint.length > 5) {
        constraints.push(constraint)
      }
    }
  })
  
  // Add default constraints if none found
  if (constraints.length === 0) {
    constraints.push('Maintain complete fidelity to original input requirements')
    constraints.push('Ensure output remains practical and actionable')
    constraints.push('Optimize for clarity, precision, and usability')
    constraints.push('Avoid unnecessary complexity or verbosity')
  }
  
  return constraints.slice(0, 5)
}

// UPDATED: Ultra-aggressive token optimization function
function optimizeTokenEfficiency(prompt: string): string {
  const lines = prompt.split('\n')
  const optimizedLines: string[] = []
  let skipNext = false
  
  for (let i = 0; i < lines.length; i++) {
    if (skipNext) {
      skipNext = false
      continue
    }
    
    let line = lines[i].trim()
    
    // Skip empty lines
    if (!line) continue
    
    // Keep section headers but simplify
    if (line.startsWith('#')) {
      // Remove technique labels from headers
      line = line.replace(/\[.*?\]/g, '').trim()
      optimizedLines.push(line)
      continue
    }
    
    // Keep code blocks but compress
    if (line.startsWith('```')) {
      optimizedLines.push(line)
      continue
    }
    
    // Compress numbered/bulleted lists
    if (/^(Step \d+:|SC\d+:|\d+\.)/.test(line)) {
      // Remove redundant words
      line = line.replace(/\b(input|output|validation|requirements?)\b/gi, (match) => {
        return match.charAt(0).toLowerCase()
      })
      optimizedLines.push(line)
      continue
    }
    
    // For other lines, keep but simplify
    if (line.length > 0) {
      optimizedLines.push(line)
    }
  }
  
  return optimizedLines.join('\n')
}

// UPDATED: Enhanced validation with more criteria
function validateSuccessCriteria(
  transformedPrompt: string, 
  originalInput: string, 
  analysis: any
) {
  const unmetCriteria: string[] = []
  const lowerPrompt = transformedPrompt.toLowerCase()
  
  // Check 1: Original content preservation
  const originalWords = new Set(originalInput.toLowerCase().split(/\s+/).filter(w => w.trim().length > 3))
  const transformedWords = new Set(transformedPrompt.toLowerCase().split(/\s+/).filter(w => w.trim()))
  const preservationRatio = originalWords.size > 0 ? [...originalWords].filter(word => transformedWords.has(word)).length / originalWords.size : 1
  
  if (preservationRatio < 0.85) {
    unmetCriteria.push('Content preservation')
  }
  
  // Check 2: All mandatory sections present
  const requiredSections = ['context', 'requirements', 'role', 'objectives', 'instructions', 'success criteria', 'constraints', 'validation loop', 'output format']
  const missingSections = requiredSections.filter(section => !lowerPrompt.includes(section.toLowerCase()))
  
  if (missingSections.length > 0) {
    unmetCriteria.push(`Structure (missing: ${missingSections.join(', ')})`)
  }
  
  // Check 3: Success criteria count
  const scCount = (transformedPrompt.match(/SC\d+:/g) || []).length
  if (scCount < 3) {
    unmetCriteria.push(`SC count (${scCount} found, need ≥3)`)
  }
  
  // Check 4: Engineering techniques
  const techniqueIndicators = ['chain-of-thought', 'task 1', 'task 2', 'role', 'background', 'validation loop']
  const foundTechniques = techniqueIndicators.filter(indicator => lowerPrompt.includes(indicator))
  if (foundTechniques.length < 4) {
    unmetCriteria.push('Engineering techniques')
  }
  
  // Check 5: Validation loop pseudocode
  if (!lowerPrompt.includes('while') || !lowerPrompt.includes('iteration')) {
    unmetCriteria.push('Validation loop pseudocode')
  }
  
  return {
    allMet: unmetCriteria.length === 0,
    unmetCriteria
  }
}

// UPDATED: Enhanced refinement function
function refinePrompt(
  currentPrompt: string, 
  unmetCriteria: string[], 
  techniquesApplied: string[],
  inputText: string,
  analysis: any
): string {
  let refined = currentPrompt
  
  // Address specific unmet criteria
  unmetCriteria.forEach(criterion => {
    if (criterion.includes('Structure')) {
      // If structure is incomplete, regenerate with comprehensive function
      refined = applyComprehensivePromptEngineering(inputText, analysis, techniquesApplied)
    } else if (criterion.includes('SC count')) {
      // Ensure 10 SCs are present
      const scSection = refined.indexOf('# Success Criteria')
      if (scSection >= 0) {
        let scContent = '# Success Criteria\n'
        analysis.successCriteria.forEach((sc: string, index: number) => {
          scContent += `**SC${index + 1}:** ${sc}\n`
        })
        scContent += '\n'
        
        const nextSection = refined.indexOf('#', scSection + 1)
        if (nextSection > 0) {
          refined = refined.substring(0, scSection) + scContent + refined.substring(nextSection)
        }
      }
    }
  })
  
  return refined
}

// UPDATED: Check for all 9 mandatory sections
function checkStructureCompliance(prompt: string) {
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
  
  const lowerPrompt = prompt.toLowerCase()
  const foundSections = requiredSections.filter(section => 
    lowerPrompt.includes(section.toLowerCase())
  )
  
  const missingSections = requiredSections.filter(section => !foundSections.includes(section))
  
  return {
    required: requiredSections.length,
    found: foundSections.length,
    missing: missingSections,
    compliance_rate: Math.round((foundSections.length / requiredSections.length) * 100) / 100
  }
}

function calculateTokenMetrics(originalText: string, transformedText: string) {
  // Simple token estimation (words)
  const originalTokens = originalText.split(/\s+/).filter(w => w.trim()).length
  const transformedTokens = transformedText.split(/\s+/).filter(w => w.trim()).length
  const expansionRatio = originalTokens > 0 ? transformedTokens / originalTokens : 1
  
  return {
    original_tokens: originalTokens,
    transformed_tokens: transformedTokens,
    expansion_ratio: Math.round(expansionRatio * 100) / 100,
    efficiency_rating: expansionRatio < 3.0 ? 'Efficient' : 'Needs Optimization'
  }
}

// NEW: Character limit enforcement with intelligent truncation
function enforceCharacterLimit(text: string, limit: number): string {
  if (text.length <= limit) {
    return text
  }
  
  // Parse sections
  const sections: { [key: string]: string } = {}
  const sectionHeaders = [
    'Context',
    'Requirements',
    'Role',
    'Objectives',
    'Instructions',
    'Success Criteria',
    'Constraints',
    'Validation',
    'Output'
  ]
  
  let currentSection = 'Preamble'
  let currentContent = ''
  const lines = text.split('\n')
  
  for (const line of lines) {
    // Check if line is a section header
    let isHeader = false
    for (const header of sectionHeaders) {
      if (line.trim().toLowerCase().includes(header.toLowerCase()) && line.startsWith('#')) {
        // Save previous section
        if (currentContent.trim()) {
          sections[currentSection] = currentContent.trim()
        }
        currentSection = header
        currentContent = line + '\n'
        isHeader = true
        break
      }
    }
    
    if (!isHeader) {
      currentContent += line + '\n'
    }
  }
  
  // Save last section
  if (currentContent.trim()) {
    sections[currentSection] = currentContent.trim()
  }
  
  // Priority allocation (percentages)
  const priorities: { [key: string]: number } = {
    'Context': 0.10,
    'Requirements': 0.15,
    'Role': 0.08,
    'Objectives': 0.10,
    'Instructions': 0.20,
    'Success Criteria': 0.15,
    'Constraints': 0.08,
    'Validation': 0.08,
    'Output': 0.06
  }
  
  // Truncate each section proportionally
  let truncated = ''
  for (const [section, priority] of Object.entries(priorities)) {
    if (sections[section]) {
      const maxChars = Math.floor(limit * priority)
      let content = sections[section]
      
      if (content.length > maxChars) {
        content = content.substring(0, maxChars - 4) + '...\n'
      }
      
      truncated += content + '\n\n'
    }
  }
  
  // Final check and trim
  if (truncated.length > limit) {
    truncated = truncated.substring(0, limit - 4) + '...\n'
  }
  
  return truncated.trim()
}
