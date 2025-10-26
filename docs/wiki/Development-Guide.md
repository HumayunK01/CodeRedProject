# 🛠️ Development Guide - Technical Documentation

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [API Integration](#api-integration)
- [PDF Report Generation](#pdf-report-generation)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 8.0.0 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **VS Code**: Recommended IDE ([Download](https://code.visualstudio.com/))

### Recommended Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**

---

## 🚀 Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/HumayunK01/CodeRedProject.git
cd CodeRed
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd apps/web
npm install
```

### 3. Environment Configuration
Create `.env.local` in `apps/web/`:
```env
# Application
VITE_APP_NAME=OutbreakLens
VITE_APP_VERSION=1.0.0

# Backend Integration (when available)
VITE_INFER_BASE_URL=http://localhost:8000
VITE_INFER_TIMEOUT_MS=15000

# API Proxy Configuration
VITE_API_BASE_URL=/api

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# Development
VITE_DEV_PROXY_TARGET=http://localhost:8000
```

### 4. Start Development Server
```bash
# From root directory
npm run dev

# Or from apps/web directory
cd apps/web
npm run dev
```

The application will be available at `http://localhost:8080`

---

## 📁 Project Structure

```
CodeRed/                          # Root monorepo directory
├── apps/
│   ├── web/                     # Frontend application
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components
│   │   │   │   ├── ui/         # shadcn/ui base components
│   │   │   │   ├── layout/     # Navigation and layout
│   │   │   │   ├── diagnosis/  # Diagnosis-specific components
│   │   │   │   └── forecast/   # Forecasting components
│   │   │   ├── pages/          # Route-based page components
│   │   │   ├── lib/            # Utilities and configurations
│   │   │   │   ├── api.ts      # API client and mock data
│   │   │   │   ├── types.ts    # TypeScript type definitions
│   │   │   │   ├── storage.ts  # Local storage utilities
│   │   │   │   └── validations.ts # Zod validation schemas
│   │   │   └── hooks/          # Custom React hooks
│   │   ├── public/             # Public assets and PWA files
│   │   ├── package.json        # Frontend dependencies
│   │   ├── vite.config.ts      # Vite config with API proxy
│   │   ├── tailwind.config.ts  # Tailwind with dark mode default
│   │   └── tsconfig.json       # TypeScript configuration
│   └── inference/              # Backend ML services (planned)
├── docs/                       # Documentation
└── README.md                   # Project overview
```

---

## 🔄 Development Workflow

### 1. Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/issue-description

# Create hotfix branch
git checkout -b hotfix/critical-fix
```

### 2. Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### 3. Code Quality
```bash
# Format code with Prettier
npx prettier --write .

# Lint code with ESLint
npm run lint

# Fix auto-fixable linting issues
npm run lint -- --fix
```

---

## 📝 Code Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Prefer `interface` over `type` for object shapes

### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow the single responsibility principle

### Component Structure
```typescript
// Component template
import React from 'react';
import { ComponentProps } from './types';

interface ComponentNameProps {
  // Define props here
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructure props
}) => {
  // Component logic here
  
  return (
    <div>
      {/* JSX here */}
    </div>
  );
};
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theming
- Implement dark mode support

---

## 🧪 Testing

### Unit Testing (Planned)
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Component Testing
```typescript
// Example test file
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## 🔌 API Integration

### Current Mock API
The frontend currently uses mock data for development:

```typescript
// apps/web/src/lib/api.ts
const DEMO_MODE = !import.meta.env.VITE_INFER_BASE_URL;

if (DEMO_MODE) {
  // Return mock data
} else {
  // Make real API calls
}
```

### Expected Backend Endpoints
```typescript
// Diagnosis Services
POST /api/predict/image
POST /api/predict/symptoms

// Forecasting Services
POST /api/forecast/region
GET /api/health
```

### API Client Usage
```typescript
import { apiClient } from '@/lib/api';

// Image prediction
const result = await apiClient.predictImage(file);

// Symptoms analysis
const result = await apiClient.predictSymptoms(symptoms);

// Regional forecast
const result = await apiClient.forecastRegion(input);
```

---

## 📄 PDF Report Generation

### Overview
OutbreakLens includes a sophisticated PDF report generation system that creates professional medical reports suitable for clinical use. The system uses jsPDF and html2canvas to convert styled HTML content into high-quality PDF documents.

### Key Components
The PDF generation is implemented in the [DiagnosisResults.tsx](file:///d:/Projects/CodeRedProject/apps/web/src/components/diagnosis/DiagnosisResults.tsx) component and consists of:

1. **HTML Template Generation** - Dynamically creates styled HTML content
2. **Canvas Rendering** - Uses html2canvas to render HTML as high-resolution images
3. **PDF Assembly** - Combines rendered pages into a single PDF document

### Implementation Details
```typescript
// Key functions in DiagnosisResults.tsx
const generateReportHtml = () => { /* Creates HTML template */ }
const downloadReport = async () => { /* Generates and downloads PDF */ }
```

### Customization
To customize the PDF generation:

1. Modify the `generateReportHtml` function to change styling and content
2. Adjust the `downloadReport` function to modify rendering quality or process
3. Update CSS styles in the HTML template for visual changes

### Dependencies
The PDF generation system relies on two key libraries specified in the root `package.json`:

```json
"dependencies": {
  "html2canvas": "^1.4.1",
  "jspdf": "^3.0.3"
}
```

### Best Practices
- Test PDF generation across different browsers
- Optimize for print with appropriate CSS styles
- Handle large content by breaking into multiple pages
- Ensure font loading with appropriate delays
- Provide fallbacks for error handling

### Documentation
For detailed information about PDF generation, see:
- [PDF Generation Documentation](../pdf-generation.md)
- [DiagnosisResults Component](file:///d:/Projects/CodeRedProject/apps/web/src/components/diagnosis/DiagnosisResults.tsx)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 8080
npx kill-port 8080

# Or use different port
npm run dev -- --port 3000
```

#### 2. TypeScript Errors
```bash
# Clear TypeScript cache
npx tsc --build --clean

# Restart TypeScript server in VS Code
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

#### 3. Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run build
```

#### 4. Styling Issues
```bash
# Regenerate Tailwind CSS
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

### Performance Issues
- Use React DevTools Profiler
- Implement code splitting with lazy loading
- Optimize images and assets
- Use React.memo for expensive components

---

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [PDF Generation Guide](../pdf-generation.md)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [TypeScript Importer](https://marketplace.visualstudio.com/items?itemName=pmneo.tsimporter)

### Community
- [GitHub Discussions](https://github.com/HumayunK01/CodeRedProject/discussions)
- [GitHub Issues](https://github.com/HumayunK01/CodeRedProject/issues)

---

## 🤝 Contributing

### Before Contributing
1. Read the [Contributing Guidelines](Contributing-Guidelines)
2. Check existing [Issues](https://github.com/HumayunK01/CodeRedProject/issues)
3. Join [Discussions](https://github.com/HumayunK01/CodeRedProject/discussions)

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

---

**Happy coding! 🚀**