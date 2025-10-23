
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Zap, Shield, Code, FileText, Lightbulb } from 'lucide-react'

export function OnboardingModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setOpen(false)
  }

  const showAgain = () => {
    localStorage.removeItem('hasSeenOnboarding')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Welcome to Hybrid Prompt Transformer
          </DialogTitle>
          <DialogDescription className="text-base">
            Transform your input text into optimized GPT prompts using advanced prompt engineering techniques
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* How to Use */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              How to Use
            </h3>
            <ol className="space-y-2 ml-7 list-decimal">
              <li className="text-sm text-gray-700">Enter or paste your input prompt in the text area</li>
              <li className="text-sm text-gray-700">Click the "Transform Prompt" button or press Ctrl+Enter</li>
              <li className="text-sm text-gray-700">Review the transformed output with comprehensive validation</li>
              <li className="text-sm text-gray-700">Explore process details to understand the transformation</li>
              <li className="text-sm text-gray-700">Download or copy the result in your preferred format</li>
            </ol>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">10 Success Criteria Validation</div>
                  <div className="text-xs text-gray-600">Comprehensive quality checks</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <Code className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Advanced Engineering Techniques</div>
                  <div className="text-xs text-gray-600">Chain-of-Thought, Tree-of-Thoughts</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Recursive Quality Assurance</div>
                  <div className="text-xs text-gray-600">Iterative refinement loop</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Multiple Export Formats</div>
                  <div className="text-xs text-gray-600">Markdown, Text, JSON, HTML</div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-600" />
              Best Practices
            </h3>
            <ul className="space-y-2 ml-7 list-disc">
              <li className="text-sm text-gray-700">Be specific about your requirements and objectives</li>
              <li className="text-sm text-gray-700">Include context about the scenario or domain</li>
              <li className="text-sm text-gray-700">Specify desired output format if applicable</li>
              <li className="text-sm text-gray-700">Use templates for common use cases</li>
              <li className="text-sm text-gray-700">Review the comparison view to understand transformations</li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Transform</span>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">Ctrl+Enter</kbd>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Clear All</span>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Copy Output</span>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">Ctrl+C</kbd>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Download</span>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">Ctrl+D</kbd>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
