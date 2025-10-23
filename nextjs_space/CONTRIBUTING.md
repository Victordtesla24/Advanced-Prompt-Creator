
# Contributing to Hybrid Prompt Transformer

Thank you for your interest in contributing to the Hybrid Prompt Transformer! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/Advanced-Prompt-Creator.git
   cd Advanced-Prompt-Creator
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   yarn install
   
   # Copy environment variables
   cp .env.example .env.local
   
   # Run development server
   yarn dev
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

## Development Process

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Maintenance tasks

Example:
```
feat(ai-enhancer): add support for Claude 3 Opus

- Integrate Anthropic API
- Add model selection in settings
- Update token tracking for Claude models

Closes #123
```

## Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update code comments
   - Document new features

2. **Test Your Changes**
   ```bash
   # Run tests
   yarn test
   
   # Build project
   yarn build
   
   # Type check
   yarn tsc --noEmit
   ```

3. **Create Pull Request**
   - Use clear, descriptive title
   - Reference related issues
   - Describe changes in detail
   - Add screenshots for UI changes

4. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Related Issues
   Closes #XXX
   ```

## Coding Standards

### TypeScript

- Use strict TypeScript
- Avoid `any` types
- Export types for reusable interfaces
- Use meaningful variable names

```typescript
// Good
interface TransformResult {
  success: boolean;
  output: string;
  tokensUsed: number;
}

// Avoid
let x: any = someFunction();
```

### React Components

- Use functional components
- Implement proper error boundaries
- Handle loading and error states
- Add accessibility attributes

```tsx
// Good
export function MyComponent({ data }: { data: string }) {
  const [loading, setLoading] = useState(false);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div role="main" aria-label="Main content">
      {data}
    </div>
  );
}
```

### File Organization

```
components/
  ├── ui/              # Reusable UI components
  ├── feature/         # Feature-specific components
  └── layout/          # Layout components

lib/
  ├── utils/           # Utility functions
  ├── hooks/           # Custom hooks
  └── types/           # Type definitions
```

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature Name', () => {
  describe('Function Name', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = myFunction(input);
      
      // Assert
      expect(result).toBe('expected');
    });
    
    it('should handle error case', () => {
      expect(() => myFunction(null)).toThrow();
    });
  });
});
```

### Coverage Goals

- Aim for 80%+ code coverage
- Test edge cases and error handling
- Include integration tests for critical paths

## Questions?

- Open an issue for questions
- Check existing issues and PRs
- Review documentation in `/docs`

Thank you for contributing! 🎉
