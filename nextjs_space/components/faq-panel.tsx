
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { HelpCircle, BookOpen, AlertTriangle, History } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const faqs = [
  {
    question: 'What is a Hybrid Prompt?',
    answer: 'A hybrid prompt combines multiple advanced prompt engineering techniques (Chain-of-Thought, Tree-of-Thoughts, Generate-Knowledge, etc.) to create comprehensive, well-structured prompts that maximize GPT model performance.'
  },
  {
    question: 'Why is my token expansion ratio high?',
    answer: 'Token expansion occurs because the transformer adds structure, context, and explicit instructions to your input. We use adaptive algorithms to keep expansion under 3x. For very short inputs, the ratio may be higher due to necessary structural elements.'
  },
  {
    question: 'What are Success Criteria?',
    answer: 'Success Criteria (SCs) are specific, measurable conditions that the transformed prompt must satisfy. They ensure quality, completeness, and adherence to requirements. The system validates all 10 SCs before finalizing the output.'
  },
  {
    question: 'How does the validation loop work?',
    answer: 'The recursive validation loop iteratively checks each Success Criterion. If any SC fails, the system regenerates that section and re-validates. This continues until all SCs pass or the maximum iteration limit is reached.'
  },
  {
    question: 'Can I edit the transformed output?',
    answer: 'Yes! The output field is editable. You can make adjustments and re-run validation without re-transforming. Use the "Validate Again" button to check your edited version against all Success Criteria.'
  },
  {
    question: 'What engineering techniques are applied?',
    answer: 'We apply 6+ advanced techniques: Chain-of-Thought (step-by-step reasoning), Tree-of-Thoughts (exploring multiple solution paths), Generate-Knowledge (incorporating relevant information), Role Prompting, Decomposition, and Recursive Improvement.'
  },
  {
    question: 'How do I structure my input for best results?',
    answer: 'Be specific and clear. Include: (1) Context/scenario, (2) Your requirements, (3) Desired objectives, (4) Any constraints, (5) Expected output format. The more detail you provide, the better the transformation.'
  },
  {
    question: 'What formats can I export?',
    answer: 'You can export in Markdown (.md), Plain Text (.txt), JSON (.json), or HTML (.html). Each format is optimized for different use cases—Markdown for documentation, JSON for programmatic access, etc.'
  }
]

const troubleshooting = [
  {
    issue: 'Transformation takes too long',
    solution: 'Complex prompts with many requirements take longer to validate. If it exceeds 30 seconds, try breaking your input into smaller, focused prompts. You can also disable some optional sections in advanced settings.'
  },
  {
    issue: 'Token efficiency test fails',
    solution: 'This happens when the transformed output is more than 3x the original token count. Try providing more detailed input (20+ words) or use the "Minimal" transformation mode for shorter inputs.'
  },
  {
    issue: 'Output doesn\'t match my expectations',
    solution: 'Be more explicit in your input. Instead of "create a report," specify "create a report including sections A, B, C with data visualizations and executive summary." Review the templates for examples.'
  },
  {
    issue: 'Keyboard shortcuts not working',
    solution: 'Ensure your browser allows keyboard shortcuts and you\'re not inside an input field (except Ctrl+Enter for transform). Some browser extensions may interfere with shortcuts.'
  },
  {
    issue: 'History not saving',
    solution: 'History is stored in browser sessionStorage. If you\'re in incognito mode or have storage disabled, history won\'t persist. Try allowing cookies and site data for this domain.'
  }
]

const changelog = [
  {
    version: '2.0',
    date: 'October 21, 2025',
    changes: [
      'Added dark mode support',
      'Implemented batch transformation for multiple prompts',
      'Added prompt editing with live preview',
      'Introduced template library with 8 pre-made templates',
      'Enhanced ambiguous prompt detection',
      'Added instant feedback mechanism',
      'Improved accordion UI with better accessibility',
      'Added FAQ, troubleshooting, and changelog panels',
      'Implemented contextual tooltips throughout the app',
      'Added "Validate Again" functionality'
    ]
  },
  {
    version: '1.0',
    date: 'October 20, 2025',
    changes: [
      'Initial release',
      'Core transformation engine',
      'Recursive validation loop',
      '10 Success Criteria validation',
      'Advanced prompt engineering techniques',
      'Token efficiency optimization',
      'Multi-format export (MD, TXT, JSON, HTML)',
      'Transformation history (last 5)',
      'Keyboard shortcuts',
      'Comprehensive test framework'
    ]
  }
]

export function FAQPanel() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <HelpCircle className="w-4 h-4" />
        Help & FAQ
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Help Center</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="troubleshooting" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Troubleshooting
              </TabsTrigger>
              <TabsTrigger value="changelog" className="gap-2">
                <History className="w-4 h-4" />
                Changelog
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-4">
              <div className="space-y-4">
                {troubleshooting.map((item, index) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {item.issue}
                    </h4>
                    <p className="text-sm text-blue-800">{item.solution}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="changelog" className="space-y-4">
              {changelog.map((release, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">Version {release.version}</h3>
                    <span className="text-sm text-gray-500">{release.date}</span>
                  </div>
                  <ul className="space-y-1">
                    {release.changes.map((change, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
