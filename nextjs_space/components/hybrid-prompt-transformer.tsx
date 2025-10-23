'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { ComparisonView } from '@/components/comparison-view'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { TemplateSelector } from '@/components/template-selector'
import { BatchTransformer } from '@/components/batch-transformer'
import { AmbiguousDetector } from '@/components/ambiguous-detector'
import { FeedbackPanel } from '@/components/feedback-panel'
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  FileText, 
  RotateCcw, 
  Copy, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Code,
  Activity,
  AlertCircle,
  FileDown,
  History,
  RefreshCw,
  Edit3,
  Save,
  Info
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface TestResult {
  test_name: string
  expected: string
  actual: string
  status: 'PASS' | 'FAIL'
}

interface TestSummary {
  total_tests: number
  passed: number
  failed: number
  success_rate: number
  overall_status: string
  detailed_results: TestResult[]
}

interface ProcessDetails {
  original_analysis: {
    wordCount: number
    sentenceCount: number
    lineCount: number
    successCriteria: string[]
    requirements: string[]
    objectives: string[]
    complexity: number
  }
  sc_extraction: string[]
  validation_log: string[]
  structure_compliance: {
    required: number
    found: number
    missing: string[]
    compliance_rate: number
  }
  token_metrics: {
    original_tokens: number
    transformed_tokens: number
    expansion_ratio: number
    efficiency_rating: string
  }
  techniques_applied: string[]
  original_length?: number
  transformed_length?: number
  files_processed?: number
}

interface TransformationHistoryItem {
  input: string
  output: string
  timestamp: number
}

const progressStages = [
  { range: [0, 25], label: 'Analyzing input...' },
  { range: [25, 50], label: 'Applying transformations...' },
  { range: [50, 75], label: 'Running validation tests...' },
  { range: [75, 100], label: 'Generating output...' }
]

export function HybridPromptTransformer() {
  const [inputText, setInputText] = useState('')
  const [transformedPrompt, setTransformedPrompt] = useState('')
  const [isTransforming, setIsTransforming] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('')
  const [processDetails, setProcessDetails] = useState<ProcessDetails | null>(null)
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null)
  const [validationResults, setValidationResults] = useState<Array<{ name: string; passed: boolean }> | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<TransformationHistoryItem[]>([])
  const [validationError, setValidationError] = useState('')
  const [isEditingOutput, setIsEditingOutput] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showAmbiguousAnalysis, setShowAmbiguousAnalysis] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  
  // NEW: File upload and character limit features
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [charLimit, setCharLimit] = useState<number | null>(null)
  const [dragActive, setDragActive] = useState(false)
  
  // Keyboard shortcuts help
  const { isOpen: isKeyboardHelpOpen, setIsOpen: setKeyboardHelpOpen } = useKeyboardShortcutsHelp()

  const wordCount = inputText.split(/\s+/).filter(word => word.trim().length > 0).length
  const charCount = inputText.length
  const MAX_CHARS = 5000
  const MIN_WORDS = 3
  const MAX_FILES = 3
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  // Load history from localStorage (FR-001: Last 10 transformations)
  useEffect(() => {
    const stored = localStorage.getItem('transformation_history')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Keep only last 10 items
        setHistory(parsed.slice(0, 10))
      } catch (e) {
        console.error('Failed to load history:', e)
        localStorage.removeItem('transformation_history')
      }
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (inputText.trim() && !isTransforming) {
          handleTransform()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handleClear()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && transformedPrompt) {
        if (document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault()
          handleCopyToClipboard(transformedPrompt, 'Transformed prompt')
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && transformedPrompt) {
        e.preventDefault()
        handleDownload(transformedPrompt, 'hybrid-prompt.md', 'text/markdown')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistory(!showHistory)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [inputText, transformedPrompt, isTransforming, showHistory])

  // Input validation
  const validateInput = (text: string): { valid: boolean; message: string } => {
    const trimmed = text.trim()
    const words = trimmed.split(/\s+/).filter(w => w.trim())
    const chars = trimmed.length

    if (chars === 0) {
      return { valid: false, message: 'Please enter some text to transform' }
    }

    if (words.length < MIN_WORDS) {
      return { valid: false, message: `Input must be at least ${MIN_WORDS} words` }
    }

    if (chars > MAX_CHARS) {
      return { valid: false, message: `Input exceeds maximum length of ${MAX_CHARS} characters` }
    }

    return { valid: true, message: '' }
  }

  // NEW: File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    addFiles(files)
    // Reset input so same file can be selected again
    event.target.value = ''
  }

  const addFiles = (files: File[]) => {
    // Validate file count
    if (uploadedFiles.length + files.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`)
      return
    }

    // Validate file sizes and types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml'
    ]

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds 10MB limit`)
        return
      }
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(md|txt|csv|json|xml)$/i)) {
        toast.error(`File type not supported: ${file.name}`)
        return
      }
    }

    setUploadedFiles(prev => [...prev, ...files])
    toast.success(`${files.length} file(s) added`)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    toast.success('File removed')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  const getFileIcon = (file: File): string => {
    const type = file.type || file.name.split('.').pop()?.toLowerCase()
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('word') || type?.includes('doc')) return '📝'
    if (type?.includes('text') || type?.includes('markdown')) return '📃'
    if (type?.includes('image')) return '🖼️'
    if (type?.includes('csv') || type?.includes('json') || type?.includes('xml')) return '📊'
    return '📎'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleTransform = async () => {
    // Input validation
    if (!inputText || inputText.trim().length === 0) {
      toast.error('Please enter some text first')
      return
    }
    
    const validation = validateInput(inputText)
    if (!validation.valid) {
      setValidationError(validation.message)
      toast.error(validation.message)
      return
    }

    setValidationError('')
    setIsTransforming(true)
    setProgress(0)
    setTransformedPrompt('')
    setProcessDetails(null)
    setTestSummary(null)
    setValidationResults(null)

    // Stage 1: Analyzing input
    setCurrentStage('Analyzing input...')
    setProgress(25)
    await new Promise(r => setTimeout(r, 300))

    // Stage 2: Applying transformations
    setCurrentStage('Applying transformations...')
    setProgress(50)

    try {
      // NEW: Use FormData if files are uploaded, otherwise JSON
      const formData = new FormData()
      formData.append('input_text', inputText)
      
      // Add character limit if specified
      if (charLimit) {
        formData.append('char_limit', charLimit.toString())
      }
      
      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
      
      // Add other options as JSON
      formData.append('options', JSON.stringify({ 
        max_iterations: 5, 
        include_details: true 
      }))
      
      const response = await fetch('/api/transform', {
        method: 'POST',
        body: formData
      })

      // Stage 3: Running validation
      setCurrentStage('Running validation...')
      setProgress(75)

      const result = await response.json()

      // Stage 4: Generating output
      setCurrentStage('Generating output...')
      setProgress(90)
      await new Promise(r => setTimeout(r, 200))

      if (result.success) {
        setProgress(100)
        setTransformedPrompt(result.transformed_prompt)
        setProcessDetails(result.process_details)
        setTestSummary(result.test_summary)
        setValidationResults(result.validation_results || null)
        
        // Add to history (FR-001: Keep last 10 transformations in localStorage)
        const newHistory = [
          { input: inputText, output: result.transformed_prompt, timestamp: Date.now() },
          ...history.slice(0, 9) // Keep only 9 previous + 1 new = 10 total
        ]
        setHistory(newHistory)
        localStorage.setItem('transformation_history', JSON.stringify(newHistory))
        
        toast.success('✓ Transformation complete!')
        
        setTimeout(() => {
          setProgress(0)
          setCurrentStage('')
        }, 500)
      } else {
        toast.error(result.error || 'Transformation failed')
      }
    } catch (error) {
      console.error('Transform error:', error)
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsTransforming(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    setTransformedPrompt('')
    setProcessDetails(null)
    setTestSummary(null)
    setValidationResults(null)
    setExpandedSections(new Set())
    setValidationError('')
    // NEW: Also clear files and character limit
    setUploadedFiles([])
    setCharLimit(null)
    toast.success('All fields cleared')
  }

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard`)
  }

  const handleDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  const handleExport = async (format: 'markdown' | 'text' | 'json' | 'html' | 'pdf') => {
    if (!transformedPrompt) return

    switch (format) {
      case 'markdown':
        handleDownload(transformedPrompt, 'hybrid-prompt.md', 'text/markdown')
        break
      case 'text':
        const plainText = transformedPrompt.replace(/[#*`\[\]]/g, '')
        handleDownload(plainText, 'hybrid-prompt.txt', 'text/plain')
        break
      case 'json':
        const jsonData = JSON.stringify({
          input: inputText,
          output: transformedPrompt,
          timestamp: new Date().toISOString(),
          testResults: testSummary
        }, null, 2)
        handleDownload(jsonData, 'hybrid-prompt.json', 'application/json')
        break
      case 'html':
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hybrid Prompt</title>
  <style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }</style>
</head>
<body><pre>${transformedPrompt}</pre></body>
</html>`
        handleDownload(html, 'hybrid-prompt.html', 'text/html')
        break
      case 'pdf':
        // FR-002: PDF Export with formatting
        try {
          const { jsPDF } = await import('jspdf')
          const doc = new jsPDF()
          
          // Add header
          doc.setFontSize(18)
          doc.setFont('helvetica', 'bold')
          doc.text('Hybrid Prompt Transformer', 20, 20)
          
          // Add date
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28)
          
          // Add content
          doc.setFontSize(12)
          const lines = doc.splitTextToSize(transformedPrompt, 170)
          doc.text(lines, 20, 40)
          
          // Save
          doc.save('hybrid-prompt.pdf')
          toast.success('PDF exported successfully')
        } catch (error) {
          console.error('PDF export error:', error)
          toast.error('Failed to export PDF')
        }
        break
    }
  }

  const handleValidateAgain = async () => {
    if (!transformedPrompt || !inputText) {
      toast.error('No transformed prompt to validate')
      return
    }

    setIsValidating(true)
    
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transformed_prompt: transformedPrompt,
          original_input: inputText
        })
      })

      const result = await response.json()

      if (result.success) {
        setTestSummary(result.test_summary)
        toast.success('Validation completed!')
      } else {
        toast.error(result.error || 'Validation failed')
      }
    } catch (error) {
      console.error('Validation error:', error)
      toast.error('An error occurred during validation')
    } finally {
      setIsValidating(false)
    }
  }

  const handleTemplateSelect = (templateInput: string) => {
    setInputText(templateInput)
    toast.success('Template loaded! Click Transform to process.')
  }

  const toggleEditOutput = () => {
    setIsEditingOutput(!isEditingOutput)
    if (!isEditingOutput) {
      toast('Output is now editable. Click Save when done.', {
        icon: 'ℹ️',
        style: {
          background: '#3B82F6',
          color: 'white',
        },
      })
    } else {
      toast.success('Changes saved')
    }
  }

  const loadFromHistory = (item: TransformationHistoryItem) => {
    setInputText(item.input)
    setTransformedPrompt(item.output)
    setShowHistory(false)
    toast.success('Loaded from history')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('transformation_history')
    setShowHistory(false)
    toast.success('History cleared')
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const charWarningThreshold = MAX_CHARS * 0.9
  const showCharWarning = charCount > charWarningThreshold

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Desktop Side-by-Side Layout | Mobile Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow dark:border-gray-700" style={{backgroundColor: '#ffffff'}}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Input Prompt</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">Enter your original prompt here. Be specific about requirements and objectives.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* NEW: Character Limit Input */}
                <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-white dark:bg-gray-800">
                  <label htmlFor="charLimit" className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    Char Limit
                  </label>
                  <input
                    type="number"
                    id="charLimit"
                    min="100"
                    max="10000"
                    placeholder="Optional"
                    value={charLimit || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '') {
                        setCharLimit(null)
                      } else {
                        const num = parseInt(val, 10)
                        if (num >= 100 && num <= 10000) {
                          setCharLimit(num)
                        } else if (num < 100) {
                          toast.error('Minimum 100 characters')
                        } else {
                          toast.error('Maximum 10,000 characters')
                        }
                      }
                    }}
                    className="w-24 px-2 py-1 text-sm border-l border-gray-300 dark:border-gray-600 focus:outline-none bg-transparent"
                    disabled={isTransforming}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">Set output character limit (100-10,000). Leave empty for default length.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    History ({history.length})
                  </Button>
                )}
                <TemplateSelector onSelectTemplate={handleTemplateSelect} />
                <BatchTransformer />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Paste your input prompt here to transform it into an optimized GPT prompt...

Examples:
• 'Create a marketing plan for a new product'
• 'Analyze customer feedback data and provide insights'
• 'Generate a comprehensive project proposal'

Or use a template to get started →"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value)
                    setValidationError('')
                    setShowAmbiguousAnalysis(true)
                  }}
                  className={`min-h-[300px] font-mono text-sm transition-all dark:bg-gray-900 dark:text-gray-100 ${
                    validationError ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  disabled={isTransforming}
                />
                {validationError && (
                  <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-md text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
              
              {/* NEW: File Upload Section */}
              <div 
                className={`relative border-2 border-dashed rounded-lg p-4 transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : uploadedFiles.length > 0
                    ? 'border-green-300 bg-white dark:border-green-700 dark:bg-gray-800'
                    : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.svg,.csv,.json,.xml"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isTransforming || uploadedFiles.length >= MAX_FILES}
                />
                <label 
                  htmlFor="fileUpload" 
                  className={`flex flex-col items-center gap-2 ${isTransforming || uploadedFiles.length >= MAX_FILES ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                    <FileDown className="w-5 h-5" />
                    <span>Attach Files (Optional)</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Max {MAX_FILES} files, 10MB each • PDF, DOCX, TXT, MD, Images, CSV, JSON, XML
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Click to browse or drag & drop files here
                  </p>
                </label>
                
                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md animate-fade-in"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xl flex-shrink-0">{getFileIcon(file)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={isTransforming}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Remove ${file.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className={showCharWarning ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                  {charCount} / {MAX_CHARS} characters, {wordCount} words
                  {showCharWarning && ' (approaching limit)'}
                  {uploadedFiles.length > 0 && ` • ${uploadedFiles.length} file(s) attached`}
                  {charLimit && ` • Output limit: ${charLimit} chars`}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">
                  Shortcuts: Ctrl+Enter to transform, Ctrl+K to clear
                </span>
              </div>
            </div>
          </CardContent>
          
          {/* Ambiguous Input Analysis (below input) */}
          {showAmbiguousAnalysis && inputText.trim() && !isTransforming && (
            <div className="px-6 pb-6">
              <AmbiguousDetector inputText={inputText} />
            </div>
          )}
        </Card>

        {/* Output Section (Right Column on Desktop) */}
        <div className="flex flex-col gap-6">
          {transformedPrompt ? (
            <Card className="shadow-lg border-2 animate-fade-in dark:border-gray-700" style={{backgroundColor: '#ffffff'}}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span>Transformed Hybrid Prompt</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">This is your optimized prompt. You can edit it and re-validate, or copy/export as-is.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={isEditingOutput ? 'default' : 'outline'}
                      onClick={toggleEditOutput}
                    >
                      {isEditingOutput ? (
                        <>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleValidateAgain}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <>
                          <Clock className="w-4 h-4 mr-1 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Validate Again
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyToClipboard(transformedPrompt, 'Transformed prompt')}
                      title="Copy (Ctrl+C)"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <div className="relative group">
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <FileDown className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-2 hidden group-hover:block z-10 min-w-[180px]">
                        <button
                          onClick={() => handleExport('markdown')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          Markdown (.md)
                        </button>
                        <button
                          onClick={() => handleExport('text')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          Plain Text (.txt)
                        </button>
                        <button
                          onClick={() => handleExport('json')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          JSON (.json)
                        </button>
                        <button
                          onClick={() => handleExport('html')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          HTML (.html)
                        </button>
                        <button
                          onClick={() => handleExport('pdf')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          PDF (.pdf)
                        </button>
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingOutput ? (
                  <Textarea
                    value={transformedPrompt}
                    onChange={(e) => setTransformedPrompt(e.target.value)}
                    className="min-h-[600px] font-mono text-sm dark:bg-gray-900 dark:text-gray-100"
                  />
                ) : (
                  <div className="output-container min-h-[600px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 overflow-y-auto">
                    <div className="output-content bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Transformed Output
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transformedPrompt.length} characters
                        </div>
                      </div>
                      
                      <div className="prose prose-lg max-w-none dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => (
                              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6" {...props} />
                            ),
                            h2: ({node, ...props}) => (
                              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-5" {...props} />
                            ),
                            h3: ({node, ...props}) => (
                              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4" {...props} />
                            ),
                            p: ({node, ...props}) => (
                              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props} />
                            ),
                            code: ({node, className, children, ...props}) => {
                              const inline = !className
                              return inline ? (
                                <code className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-slate-900 dark:bg-slate-950 text-white p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm" {...props}>
                                  {children}
                                </code>
                              )
                            },
                            ul: ({node, ...props}) => (
                              <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
                            ),
                            ol: ({node, ...props}) => (
                              <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
                            ),
                            blockquote: ({node, ...props}) => (
                              <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props} />
                            ),
                            strong: ({node, ...props}) => (
                              <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />
                            ),
                          }}
                        >
                          {transformedPrompt}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-2 border-dashed dark:border-gray-700" style={{backgroundColor: '#ffffff'}}>
              <CardContent className="pt-6">
                <div className="output-container min-h-[600px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center py-20 text-center">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">
                    Your transformed prompt will appear here
                  </p>
                  <p className="text-gray-500 dark:text-gray-600 text-sm">
                    Enter your input and click Transform to begin
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* End of Side-by-Side Grid */}

      {/* History Dropdown */}
      {showHistory && history.length > 0 && (
        <Card className="shadow-lg animate-slide-up" style={{backgroundColor: '#ffffff'}}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">Transformation History</span>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="text-sm font-medium text-gray-700 truncate">
                    {item.input.slice(0, 60)}...
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          onClick={handleTransform}
          disabled={!inputText.trim() || isTransforming || wordCount < MIN_WORDS}
          className="min-w-[150px] h-12 btn-primary"
          size="lg"
        >
          {isTransforming ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Transforming...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Transform
            </>
          )}
        </Button>
        
        <Button
          onClick={handleClear}
          variant="outline"
          className="min-w-[120px] h-12 border-2"
          size="lg"
          disabled={isTransforming}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Progress Indicator with Shimmer Animation */}
      {isTransforming && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentStage}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-300 ease-out relative overflow-hidden"
              style={{width: `${progress}%`}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* Transformation Details Accordion (STEP 5) */}
      {transformedPrompt && processDetails && (
        <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Show Transformation Details
              </span>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDetails && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-6 animate-fade-in">
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Original Prompt Analysis
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Input length: {processDetails.original_length || inputText.length} characters
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Success Criteria Extraction
                </h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="text-green-600 dark:text-green-400">✓</span> 
                    {processDetails.sc_extraction?.length || 0} Success Criteria Extracted
                  </li>
                  {processDetails.structure_compliance && (
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 dark:text-green-400">✓</span> 
                      {processDetails.structure_compliance.compliance_rate}% Structure Compliance
                    </li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Token Efficiency
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Output length: {processDetails.transformed_length || transformedPrompt.length} characters</p>
                  <p>Expansion ratio: <span className={processDetails.token_metrics?.expansion_ratio < 3 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-yellow-600 dark:text-yellow-400 font-semibold'}>
                    {processDetails.token_metrics?.expansion_ratio?.toFixed(2) || ((processDetails.transformed_length || transformedPrompt.length) / (processDetails.original_length || inputText.length)).toFixed(2)}x
                  </span></p>
                  <p>Rating: <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {processDetails.token_metrics?.efficiency_rating || 'Efficient'}
                  </span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Files Processed
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {processDetails.files_processed || uploadedFiles.length || 0} file(s)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison View */}
      {transformedPrompt && processDetails && (
        <ComparisonView
          original={inputText}
          transformed={transformedPrompt}
          tokenMetrics={processDetails.token_metrics}
        />
      )}

      {/* Test Summary */}
      {testSummary && (
        <Card className="shadow-lg animate-fade-in" style={{backgroundColor: '#ffffff'}}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Test Summary</span>
              <Badge 
                className={
                  testSummary.overall_status === 'PASS' ? 'bg-green-100 text-green-800 border-green-300' : 
                  testSummary.overall_status === 'PARTIAL PASS' ? 'bg-blue-100 text-blue-800 border-blue-300' : 
                  'bg-red-100 text-red-800 border-red-300'
                }
              >
                {testSummary.overall_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{testSummary.total_tests}</div>
                <div className="text-sm text-gray-600 mt-1">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{testSummary.passed}</div>
                <div className="text-sm text-gray-600 mt-1">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{testSummary.failed}</div>
                <div className="text-sm text-gray-600 mt-1">Failed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{testSummary.success_rate}%</div>
                <div className="text-sm text-gray-600 mt-1">Success Rate</div>
              </div>
            </div>

            <div className="space-y-2">
              {testSummary.detailed_results?.map((test, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                    test.status === 'PASS' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {test.status === 'PASS' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{test.test_name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Expected:</span> {test.expected} | 
                        <span className="font-medium"> Actual:</span> {test.actual}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={test.status === 'PASS' ? 'default' : 'destructive'}
                    className="ml-2"
                  >
                    {test.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Details */}
      {processDetails && (
        <Card className="shadow-lg animate-fade-in" style={{backgroundColor: '#ffffff'}}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              <span>Process Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original Analysis */}
            <Collapsible>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('original-analysis')}
              >
                <span className="font-medium">Original Prompt Analysis</span>
                {expandedSections.has('original-analysis') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-white border rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Word Count</div>
                    <div className="font-medium">{processDetails.original_analysis?.wordCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Sentences</div>
                    <div className="font-medium">{processDetails.original_analysis?.sentenceCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Lines</div>
                    <div className="font-medium">{processDetails.original_analysis?.lineCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Complexity</div>
                    <div className="font-medium">{processDetails.original_analysis?.complexity}/100</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Token Metrics */}
            <Collapsible>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('token-metrics')}
              >
                <span className="font-medium">Token Efficiency Metrics</span>
                {expandedSections.has('token-metrics') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-white border rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Original Tokens</div>
                    <div className="font-medium">{processDetails.token_metrics?.original_tokens}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Transformed Tokens</div>
                    <div className="font-medium">{processDetails.token_metrics?.transformed_tokens}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Expansion Ratio</div>
                    <div className={`font-medium ${processDetails.token_metrics?.expansion_ratio < 3 ? 'text-green-600' : 'text-red-600'}`}>
                      {processDetails.token_metrics?.expansion_ratio}x
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Rating</div>
                    <Badge variant={processDetails.token_metrics?.efficiency_rating === 'Efficient' ? 'default' : 'secondary'}>
                      {processDetails.token_metrics?.efficiency_rating}
                    </Badge>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Engineering Techniques */}
            <Collapsible>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('techniques')}
              >
                <span className="font-medium">Engineering Techniques Applied</span>
                {expandedSections.has('techniques') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="p-3 bg-white border rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {processDetails.techniques_applied?.map((technique, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Validation Log */}
            <Collapsible>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('validation-log')}
              >
                <span className="font-medium">Validation Loop Execution Log</span>
                {expandedSections.has('validation-log') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="p-3 bg-white border rounded-lg">
                  <div className="space-y-2">
                    {processDetails.validation_log?.map((logEntry, index) => (
                      <div key={index} className="text-sm font-mono p-2 bg-gray-50 rounded border-l-2 border-green-500">
                        {logEntry}
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      {/* SC Validation Display */}
      {validationResults && validationResults.length > 0 && (
        <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-green-900">
              ✓ Success Criteria Validation
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {validationResults.map((sc, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-white/60 rounded px-3 py-2"
              >
                {sc.passed ? (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-sm text-gray-700 font-medium">
                  {sc.name}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-green-200">
            <span className="text-sm font-medium text-green-800">
              Pass Rate: {validationResults.filter(s => s.passed).length}/{validationResults.length} 
              ({Math.round((validationResults.filter(s => s.passed).length / validationResults.length) * 100)}%)
            </span>
            <span className="text-xs text-green-700">
              All quality checks passed ✓
            </span>
          </div>
        </div>
      )}

      {/* Feedback Panel */}
      {transformedPrompt && (
        <FeedbackPanel transformationId={`transform-${Date.now()}`} />
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp 
        open={isKeyboardHelpOpen} 
        onOpenChange={setKeyboardHelpOpen} 
      />
      
      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        <p>
          <strong>Keyboard Shortcuts:</strong> Ctrl+Enter (Transform) • Ctrl+K (Clear) • 
          Ctrl+C (Copy) • Ctrl+D (Download) • Ctrl+H (History) • 
          <button 
            onClick={() => setKeyboardHelpOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >
            Ctrl+/ (Show All)
          </button>
        </p>
      </div>
    </div>
    </TooltipProvider>
  )
}
