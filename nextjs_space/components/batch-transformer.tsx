
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Layers, Download, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BatchResult {
  input: string
  output: string
  status: 'success' | 'error'
  error?: string
}

export function BatchTransformer() {
  const [open, setOpen] = useState(false)
  const [batchInput, setBatchInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BatchResult[]>([])

  const handleBatchTransform = async () => {
    const prompts = batchInput
      .split('\n---\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    if (prompts.length === 0) {
      toast.error('Please enter at least one prompt. Separate multiple prompts with "---" on a new line.')
      return
    }

    if (prompts.length > 10) {
      toast.error('Maximum 10 prompts allowed per batch')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setResults([])

    const batchResults: BatchResult[] = []

    for (let i = 0; i < prompts.length; i++) {
      try {
        const response = await fetch('/api/transform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input_text: prompts[i],
            options: { max_iterations: 5, include_details: false }
          })
        })

        const result = await response.json()

        if (result.success) {
          batchResults.push({
            input: prompts[i],
            output: result.transformed_prompt,
            status: 'success'
          })
        } else {
          batchResults.push({
            input: prompts[i],
            output: '',
            status: 'error',
            error: result.error || 'Transformation failed'
          })
        }
      } catch (error) {
        batchResults.push({
          input: prompts[i],
          output: '',
          status: 'error',
          error: 'Network error'
        })
      }

      setProgress(((i + 1) / prompts.length) * 100)
      setResults([...batchResults])
    }

    setIsProcessing(false)
    toast.success(`Batch transformation complete! ${batchResults.filter(r => r.status === 'success').length}/${prompts.length} successful`)
  }

  const handleDownloadAll = () => {
    const content = results
      .map((result, i) => {
        if (result.status === 'success') {
          return `# Prompt ${i + 1}\n\n## Input\n${result.input}\n\n## Output\n${result.output}\n\n---\n\n`
        } else {
          return `# Prompt ${i + 1}\n\n## Input\n${result.input}\n\n## Error\n${result.error}\n\n---\n\n`
        }
      })
      .join('')

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-transformation-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Batch results downloaded')
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Layers className="w-4 h-4" />
        Batch Transform
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Batch Transformation</DialogTitle>
            <DialogDescription>
              Transform multiple prompts at once. Separate each prompt with "---" on a new line. Maximum 10 prompts per batch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Input Area */}
            <div>
              <label className="text-sm font-medium mb-2 block">Enter Prompts (separated by "---")</label>
              <Textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Enter first prompt here

---

Enter second prompt here

---

Enter third prompt here"
                className="min-h-[200px] font-mono text-sm"
                disabled={isProcessing}
              />
              <div className="text-xs text-gray-500 mt-1">
                {batchInput.split('\n---\n').filter(p => p.trim()).length} prompts detected
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleBatchTransform}
                disabled={isProcessing || !batchInput.trim()}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Start Batch Transformation'}
              </Button>
              {results.length > 0 && !isProcessing && (
                <Button variant="outline" onClick={handleDownloadAll} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download All
                </Button>
              )}
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-gray-600">
                  Processing {Math.floor(progress)}% complete...
                </p>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Results</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {results.filter(r => r.status === 'success').length} Success
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {results.filter(r => r.status === 'error').length} Failed
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {results.map((result, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">Prompt {i + 1}</span>
                        <Badge
                          variant={result.status === 'success' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {result.input.substring(0, 100)}...
                      </p>
                      {result.status === 'error' && (
                        <div className="flex items-center gap-1 text-xs text-red-700">
                          <AlertCircle className="w-3 h-3" />
                          {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
