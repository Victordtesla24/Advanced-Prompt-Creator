'use client'

import { HybridPromptTransformer } from '@/components/hybrid-prompt-transformer'
import { OnboardingModal } from '@/components/onboarding-modal'
import { AISettingsModal } from '@/components/ai-settings-modal'
import { ThemeToggle } from '@/components/theme-toggle'
import { FAQPanel } from '@/components/faq-panel'
import { CheckCircle2, Zap, Shield, Sparkles, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAISettings, setShowAISettings] = useState(false)

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900 transition-all" style={{backgroundColor: '#ffffff'}}>
      <OnboardingModal />
      
      {/* Professional Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Advanced Prompt Creator
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOnboarding(true)}
              className="hidden sm:flex"
            >
              Quick Start
            </Button>
            <button
              onClick={() => setShowAISettings(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Open AI Settings"
              title="AI Integration Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">AI Settings</span>
            </button>
            <FAQPanel />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12" style={{backgroundColor: 'transparent'}}>
        {/* Enhanced Hero Section */}
        <div className="text-center mb-12 animate-fade-in" style={{backgroundColor: 'transparent'}}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-lg mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 dark:text-gray-100 mb-4">
            Hybrid Prompt Transformer
          </h2>
          
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-700 dark:text-gray-200">
            Transform your input text into optimized GPT prompts using advanced prompt engineering techniques 
            with comprehensive validation and testing
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8 mb-12">
            <div className="flex items-center justify-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: '0.1s'}}>
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">10 Success Criteria Validation</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Advanced Engineering Techniques</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Recursive Quality Assurance</span>
            </div>
          </div>
        </div>
        
        <HybridPromptTransformer />
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 Advanced Prompt Creator. Powered by advanced prompt engineering techniques.</p>
            <p className="mt-1">Built with Next.js, TypeScript, and Tailwind CSS</p>
          </div>
        </div>
      </footer>

      {/* AI Settings Modal */}
      <AISettingsModal 
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />
    </main>
  )
}
