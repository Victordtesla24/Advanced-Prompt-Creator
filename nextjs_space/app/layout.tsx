
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hybrid Prompt Transformer',
  description: 'Transform input text into optimized GPT prompts using advanced prompt engineering techniques',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Skip Links for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: 'white',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
                color: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
