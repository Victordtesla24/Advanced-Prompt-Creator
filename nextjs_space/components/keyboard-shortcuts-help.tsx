
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  {
    category: 'Transformation',
    items: [
      { keys: ['Ctrl', 'Enter'], description: 'Transform input prompt' },
      { keys: ['Ctrl', 'K'], description: 'Clear all inputs' },
      { keys: ['Ctrl', 'R'], description: 'Validate again' },
    ]
  },
  {
    category: 'Output Actions',
    items: [
      { keys: ['Ctrl', 'C'], description: 'Copy transformed output' },
      { keys: ['Ctrl', 'D'], description: 'Download as file' },
      { keys: ['Ctrl', 'E'], description: 'Export options' },
    ]
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['Ctrl', 'H'], description: 'Toggle history panel' },
      { keys: ['Ctrl', 'T'], description: 'Open template library' },
      { keys: ['Ctrl', '/'], description: 'Show this help' },
      { keys: ['Escape'], description: 'Close modals/dialogs' },
    ]
  },
]

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="w-6 h-6 text-blue-600" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to work more efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((shortcut, shortcutIndex) => (
                  <div 
                    key={shortcutIndex}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          {keyIndex > 0 && (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">+</span>
                          )}
                          <Badge 
                            variant="outline" 
                            className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 font-mono text-xs font-semibold"
                          >
                            {key}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Pro Tip:</strong> These shortcuts work globally throughout the application.
            Press <Badge variant="outline" className="mx-1 font-mono">Ctrl+/</Badge> anytime to show this help dialog.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to manage keyboard shortcuts help visibility
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ or Cmd+/ to toggle help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { isOpen, setIsOpen }
}
