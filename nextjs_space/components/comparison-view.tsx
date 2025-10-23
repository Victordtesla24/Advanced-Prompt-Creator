'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight, Eye, EyeOff } from 'lucide-react'

interface ComparisonViewProps {
  original: string
  transformed: string
  tokenMetrics: {
    original_tokens: number
    transformed_tokens: number
    expansion_ratio: number
  }
}

export function ComparisonView({ original, transformed, tokenMetrics }: ComparisonViewProps) {
  const [showDiff, setShowDiff] = useState(false)

  return (
    <Card className="shadow-lg border-2 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            <span>Comparison View</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiff(!showDiff)}
          >
            {showDiff ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showDiff ? 'Hide' : 'Show'} Highlights
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Original Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-700">Original Input</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {tokenMetrics.original_tokens} tokens
              </Badge>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[200px] max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800">{original}</pre>
            </div>
          </div>

          {/* Transformed Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-700">Transformed Output</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {tokenMetrics.transformed_tokens} tokens
                </Badge>
                <Badge 
                  variant="outline" 
                  className={
                    tokenMetrics.expansion_ratio < 3 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-orange-50 text-orange-700'
                  }
                >
                  {tokenMetrics.expansion_ratio}x expansion
                </Badge>
              </div>
            </div>
            <div className={`rounded-lg p-4 border min-h-[200px] max-h-[400px] overflow-y-auto ${
              showDiff ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800">{transformed}</pre>
            </div>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{tokenMetrics.original_tokens}</div>
            <div className="text-xs text-gray-600 mt-1">Original Tokens</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{tokenMetrics.transformed_tokens}</div>
            <div className="text-xs text-gray-600 mt-1">Transformed Tokens</div>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <div className={`text-2xl font-bold ${
              tokenMetrics.expansion_ratio < 3 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {tokenMetrics.expansion_ratio}x
            </div>
            <div className="text-xs text-gray-600 mt-1">Expansion Ratio</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
