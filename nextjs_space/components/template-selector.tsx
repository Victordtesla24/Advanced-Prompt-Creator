
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Briefcase, Code, BookOpen, Palette, FlaskConical, FileBarChart, Rocket } from 'lucide-react'
import { toast } from 'sonner'

const templates = [
  {
    id: 'business-plan',
    name: 'Business Plan',
    description: 'Create a comprehensive business plan',
    icon: Briefcase,
    category: 'Business & Strategy',
    input: 'Create a detailed business plan for a sustainable fashion e-commerce startup. Include executive summary, market analysis, competitive landscape, unique value proposition, revenue model, marketing strategy, financial projections for 3 years, team structure, and implementation timeline with key milestones.',
  },
  {
    id: 'marketing-strategy',
    name: 'Marketing Strategy',
    description: 'Develop a marketing strategy',
    icon: Rocket,
    category: 'Marketing & Sales',
    input: 'Develop a comprehensive digital marketing strategy for launching a SaaS product targeting small businesses. Cover target audience personas, positioning statement, channel selection (SEO, social media, content marketing, paid ads), budget allocation across channels, KPIs and success metrics, content calendar, and customer acquisition funnel optimization.',
  },
  {
    id: 'technical-doc',
    name: 'Technical Documentation',
    description: 'Generate technical documentation',
    icon: Code,
    category: 'Technology & Development',
    input: 'Create comprehensive technical documentation for a REST API. Include API overview and architecture, authentication methods, all available endpoints with request/response examples, error handling and status codes, rate limiting details, best practices for integration, code samples in Python and JavaScript, and troubleshooting guide.',
  },
  {
    id: 'research-report',
    name: 'Research Report',
    description: 'Structure a research report',
    icon: FlaskConical,
    category: 'Science & Research',
    input: 'Structure a research report analyzing the impact of remote work on employee productivity and mental health. Include abstract, introduction with research questions, literature review, methodology (sample size, data collection methods), results with statistical analysis, discussion of findings, limitations, practical implications, and recommendations for organizations.',
  },
  {
    id: 'educational-content',
    name: 'Educational Content',
    description: 'Create educational materials',
    icon: BookOpen,
    category: 'Education & Training',
    input: 'Create a comprehensive educational module teaching machine learning fundamentals to beginners with programming background. Include learning objectives, prerequisite knowledge, core concepts (supervised/unsupervised learning, algorithms), hands-on exercises, real-world applications, assessment questions, additional resources, and a capstone project.',
  },
  {
    id: 'creative-brief',
    name: 'Creative Brief',
    description: 'Develop a creative brief',
    icon: Palette,
    category: 'Creative & Content',
    input: 'Develop a creative brief for a brand refresh campaign targeting millennials. Include project background, brand positioning, target audience insights, key message and tone, creative requirements (logo, visuals, tagline), deliverables list, project timeline, success criteria, and brand guidelines to follow.',
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Report',
    description: 'Analyze data and report findings',
    icon: FileBarChart,
    category: 'Business & Strategy',
    input: 'Analyze customer churn data and create an actionable report for stakeholders. Include executive summary, data sources and methodology, key findings with visualizations, churn patterns and trends, root cause analysis, customer segmentation insights, predictive indicators, recommended retention strategies, and implementation roadmap.',
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Write a project proposal',
    icon: FileText,
    category: 'Business & Strategy',
    input: 'Write a project proposal for implementing an AI-powered customer service chatbot. Include problem statement, proposed solution overview, technical approach, implementation phases, resource requirements (team, tools, budget), timeline with milestones, risk assessment, expected ROI and benefits, and success metrics.',
  },
]

interface TemplateSelectorProps {
  onSelectTemplate: (input: string) => void
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(templates.map(t => t.category)))

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates

  const handleSelectTemplate = (template: typeof templates[0]) => {
    onSelectTemplate(template.input)
    setOpen(false)
    toast.success(`${template.name} template loaded`)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <FileText className="w-4 h-4" />
        Use Template
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Template Library</DialogTitle>
            <DialogDescription>
              Choose from pre-made templates for common use cases
            </DialogDescription>
          </DialogHeader>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Templates
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {filteredTemplates.map(template => {
              const Icon = template.icon
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-500"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm">{template.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                      {template.input.substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
