
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface AmbiguousDetectorProps {
  inputText: string
  onAnalysisComplete?: (issues: Issue[]) => void
}

interface Issue {
  type: 'warning' | 'error' | 'success'
  message: string
  severity: 'high' | 'medium' | 'low'
}

export function AmbiguousDetector({ inputText, onAnalysisComplete }: AmbiguousDetectorProps) {
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    if (!inputText.trim()) {
      setIssues([])
      return
    }

    const detectedIssues: Issue[] = []
    const words = inputText.split(/\s+/).filter(w => w.trim())
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim())

    // Check for vague language
    const vagueWords = ['something', 'somehow', 'maybe', 'possibly', 'things', 'stuff']
    const foundVague = vagueWords.some(word => 
      inputText.toLowerCase().includes(word.toLowerCase())
    )
    
    if (foundVague) {
      detectedIssues.push({
        type: 'warning',
        message: 'Contains vague language. Try to be more specific.',
        severity: 'medium'
      })
    }

    // Check for missing context
    if (words.length < 10) {
      detectedIssues.push({
        type: 'warning',
        message: 'Input may be too brief. Consider adding more context.',
        severity: 'medium'
      })
    }

    // Check for unclear objectives
    const objectiveKeywords = ['create', 'generate', 'develop', 'analyze', 'write', 'design', 'build']
    const hasObjective = objectiveKeywords.some(keyword => 
      inputText.toLowerCase().includes(keyword.toLowerCase())
    )
    
    if (!hasObjective) {
      detectedIssues.push({
        type: 'warning',
        message: 'No clear objective detected. What do you want to accomplish?',
        severity: 'high'
      })
    }

    // Check for missing requirements
    const requirementIndicators = ['include', 'must', 'should', 'need', 'require', 'with']
    const hasRequirements = requirementIndicators.some(indicator => 
      inputText.toLowerCase().includes(indicator.toLowerCase())
    )
    
    if (!hasRequirements && words.length > 20) {
      detectedIssues.push({
        type: 'warning',
        message: 'Consider specifying explicit requirements or constraints.',
        severity: 'low'
      })
    }

    // Check for ambiguous pronouns
    const ambiguousPronouns = ['it', 'this', 'that', 'these', 'those', 'they']
    const pronounCount = ambiguousPronouns.reduce((count, pronoun) => {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'gi')
      return count + (inputText.match(regex) || []).length
    }, 0)
    
    if (pronounCount > 3) {
      detectedIssues.push({
        type: 'warning',
        message: 'Multiple ambiguous pronouns detected. Specify what they refer to.',
        severity: 'low'
      })
    }

    // Success case
    if (detectedIssues.length === 0 && words.length >= 15) {
      detectedIssues.push({
        type: 'success',
        message: 'Input looks clear and well-structured!',
        severity: 'low'
      })
    }

    setIssues(detectedIssues)
    onAnalysisComplete?.(detectedIssues)
  }, [inputText, onAnalysisComplete])

  if (issues.length === 0) return null

  return (
    <Card className="shadow-sm border-l-4 border-l-blue-500">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Input Analysis</p>
            <div className="space-y-1.5">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2">
                  {issue.type === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : issue.type === 'error' ? (
                    <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">{issue.message}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      issue.severity === 'high'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : issue.severity === 'medium'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {issue.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
