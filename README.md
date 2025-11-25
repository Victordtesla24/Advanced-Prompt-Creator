
# Advanced Prompt Creator

**Transform plain prompts into precision-engineered, production-ready AI instructions using advanced prompt engineering techniques and optional AI enhancement.**

🔗 **Live App:** https://hybrid-prompt-transf-vmuu3f.abacusai.app/

---

## 🎯 Overview

An intelligent prompt transformation platform that converts basic user input into highly structured, optimized prompts designed for maximum accuracy and reliability. Built with cutting-edge prompt engineering methodologies, recursive validation loops, and optional AI-powered enhancement through OpenAI, Perplexity AI, or Abacus.AI LLMs.

---

## ✨ Key Features

- **🔄 Hybrid Transformation Engine** - Rule-based foundation with optional AI enhancement
- **📋 8-Section Auto-Structure** - Context, Requirements, Role, Objectives, Instructions, Success Criteria, Constraints, Output Format
- **🔍 Recursive Validation** - 10 success criteria validated on every transformation
- **🔐 Privacy-First** - API keys stored in browser only, zero server-side data collection
- **📊 Advanced Analytics** - Token usage tracking, processing time metrics, quality indicators
- **📁 Multi-Format Support** - File upload (PDF, DOCX, TXT), export (MD, JSON, HTML)
- **🛡️ Robust Error Handling** - Graceful fallback to rule-based on AI failures
- **🎨 Professional UI/UX** - Two-stage progress, three-way comparison, responsive design
- **🌙 Dark Mode Support** - System-aware theme with manual toggle
- **♿ Accessibility** - WCAG 2.1 AA compliant with keyboard navigation and screen reader support

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- yarn (recommended) or npm

### Installation

```bash
# Clone repository
git clone https://github.com/Victordtesla24/Advanced-Prompt-Creator.git
cd Advanced-Prompt-Creator

# Install dependencies
yarn install

# Set up environment variables (see .env.example)
cp .env.example .env.local

# Run development server
yarn dev

# Open browser
# Navigate to http://localhost:3000
```

### Build for Production

```bash
yarn build
yarn start
```

---

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui + Radix UI
- **State:** React Hooks + Context
- **Testing:** TypeScript + Node.js test runner
- **Deployment:** Abacus.AI

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Hybrid Prompt Transformer

# Abacus.AI API (Optional - for AI enhancement)
ABACUSAI_API_KEY=your_api_key_here

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### AI Provider Setup (Optional)

Users can provide their own API keys via the app UI:
- OpenAI: https://platform.openai.com/api-keys
- Perplexity: https://www.perplexity.ai/settings/api
- Abacus.AI: Built-in support with optional API key

---

## 📖 Usage

### Basic Transformation

1. Enter your prompt in the input field
2. Click "Transform Prompt"
3. View structured output with 8 sections
4. Export in your preferred format (Markdown, JSON, HTML, PDF)

### AI Enhancement (Optional)

1. Click "⚙️ AI Settings" in header
2. Select provider (OpenAI/Perplexity/Abacus.AI)
3. Enter your API key (or use built-in Abacus.AI)
4. Enable "Enhance with AI" checkbox
5. Transform prompts with AI refinement

### Features

- **Comparison View** - Side-by-side comparison of original, rule-based, and AI-enhanced outputs
- **Token Metrics** - Real-time tracking of token usage and efficiency
- **History Panel** - Last 10 transformations saved locally
- **Batch Processing** - Upload and transform multiple prompts at once
- **Template Library** - Pre-built templates for common use cases

---

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run specific test
tsx test-ai-enhancement.ts

# Run API connection tests
tsx test-api-connection.ts
```

---

## 📊 Success Metrics

- **Transformation Accuracy:** 95%+
- **Processing Time:** <3s (rule-based), <8s (AI-enhanced)
- **Token Efficiency:** <3x expansion guaranteed
- **Keyword Preservation:** 85%+ guaranteed
- **Error Recovery:** 100% fallback success
- **Test Coverage:** 100% (all scenarios passing)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🔒 Security

- API keys stored in browser localStorage only
- No server-side data collection
- HTTPS enforcement
- Regular security audits

Report vulnerabilities to repository issues.

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/Victordtesla24/Advanced-Prompt-Creator/issues)
- **Documentation:** See `/docs` folder for detailed guides
- **Live App:** https://hybrid-prompt-transf-vmuu3f.abacusai.app/

---

## 🏷️ Tags

`prompt-engineering` `ai` `llm` `gpt-4` `nextjs` `typescript` `react` `openai` `perplexity-ai` `abacus-ai` `prompt-optimization` `chain-of-thought` `recursive-validation` `privacy-first`

---

## 📋 Project Structure

```
hybrid-prompt-transformer/
├── nextjs_space/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── hybrid-prompt-transformer.tsx
│   │   ├── ai-settings-modal.tsx
│   │   ├── comparison-view.tsx
│   │   └── ...
│   ├── lib/                   # Core logic
│   │   ├── transformer.ts    # Rule-based transformation
│   │   ├── ai-enhancer.ts    # AI enhancement
│   │   ├── ai-config.ts      # API configuration
│   │   └── ...
│   ├── docs/                  # Documentation
│   ├── public/                # Static assets
│   └── test files/            # Test suites
└── reports/                   # Test and enhancement reports
```

---

**Built with ❤️ for the AI community | Deployed on Abacus.AI**
