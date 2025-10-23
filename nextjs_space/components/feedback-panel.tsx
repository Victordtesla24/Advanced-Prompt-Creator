
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import { toast } from 'sonner'

interface FeedbackPanelProps {
  transformationId: string
}

export function FeedbackPanel({ transformationId }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  const [comments, setComments] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type)
    setShowComments(true)
    if (type === 'positive') {
      toast.success('Thank you for your positive feedback!')
    }
  }

  const handleSubmit = () => {
    // Store feedback in localStorage for future analytics
    try {
      const feedbackData = {
        transformationId,
        feedback,
        comments,
        timestamp: new Date().toISOString()
      }
      
      const existingFeedback = localStorage.getItem('user_feedback')
      const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : []
      feedbackArray.push(feedbackData)
      
      // Keep only last 50 feedback items
      const trimmedFeedback = feedbackArray.slice(-50)
      localStorage.setItem('user_feedback', JSON.stringify(trimmedFeedback))
    } catch (error) {
      // Silently fail if localStorage is unavailable
    }
    
    setSubmitted(true)
    toast.success('Thank you! Your feedback helps us improve.')
    
    // Reset after 3 seconds
    setTimeout(() => {
      setFeedback(null)
      setComments('')
      setShowComments(false)
      setSubmitted(false)
    }, 3000)
  }

  if (submitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-green-800 font-medium">✓ Feedback submitted successfully</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium mb-3">Was this transformation helpful?</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant={feedback === 'positive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFeedback('positive')}
                className="gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Yes, helpful
              </Button>
              <Button
                variant={feedback === 'negative' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFeedback('negative')}
                className="gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Needs improvement
              </Button>
            </div>
          </div>

          {showComments && (
            <div className="space-y-3 animate-fade-in">
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  feedback === 'positive'
                    ? 'Tell us what you liked... (optional)'
                    : 'How can we improve this transformation?'
                }
                className="min-h-[80px] text-sm"
              />
              <Button
                size="sm"
                onClick={handleSubmit}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Feedback
              </Button>
            </div>
          )}

          {feedback === 'negative' && showComments && (
            <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Tips for better results:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Provide more specific requirements</li>
                <li>Include context about your use case</li>
                <li>Try using a template as a starting point</li>
                <li>Edit the output and re-validate</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
