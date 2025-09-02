# 📁 Proposed Folder Structure for BioSentinel

## Current Structure Analysis

The current `src/` folder is already well-organized with good separation of concerns. Here's the analysis and proposed improvements:

## ✅ Current Structure (Already Good)

```
src/
├── components/           # ✅ Well organized by feature
│   ├── ui/              # ✅ shadcn/ui base components
│   ├── layout/          # ✅ Navigation and layout components
│   ├── diagnosis/       # ✅ Feature-specific components
│   └── forecast/        # ✅ Feature-specific components
├── pages/               # ✅ Route-based page components
├── lib/                 # ✅ Utilities and configurations
├── hooks/               # ✅ Custom React hooks
└── main.tsx             # ✅ Entry point
```

## 🚀 Proposed Improvements for Scalability

### 1. Enhanced Component Organization

```
src/
├── components/
│   ├── ui/                     # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── MainLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── features/               # Feature-specific components
│   │   ├── diagnosis/
│   │   │   ├── DiagnosisResults.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── SymptomsForm.tsx
│   │   │   └── index.ts        # Barrel exports
│   │   ├── forecast/
│   │   │   ├── ForecastChart.tsx
│   │   │   ├── ForecastForm.tsx
│   │   │   ├── ForecastMap.tsx
│   │   │   └── index.ts
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       ├── RecentActivity.tsx
│   │       └── index.ts
│   ├── common/                 # Shared/common components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── PageHeader.tsx
│   │   └── index.ts
│   └── index.ts               # Main barrel export
```

### 2. Enhanced Library Structure

```
src/
├── lib/
│   ├── api/                   # API-related utilities
│   │   ├── client.ts          # API client configuration
│   │   ├── endpoints.ts       # API endpoint definitions
│   │   ├── types.ts           # API response types
│   │   └── mock-data.ts       # Mock data for development
│   ├── utils/                 # General utilities
│   │   ├── formatters.ts      # Date, number formatters
│   │   ├── validators.ts      # Input validation helpers
│   │   ├── constants.ts       # App constants
│   │   └── helpers.ts         # General helper functions
│   ├── hooks/                 # Custom hooks
│   │   ├── useApi.ts          # API hook
│   │   ├── useLocalStorage.ts # Local storage hook
│   │   ├── useTheme.ts        # Theme management hook
│   │   └── index.ts
│   ├── stores/                # State management (if needed)
│   │   ├── authStore.ts
│   │   ├── diagnosisStore.ts
│   │   └── index.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── diagnosis.ts
│   │   ├── forecast.ts
│   │   └── index.ts
│   └── config/                # Configuration files
│       ├── env.ts             # Environment variables
│       ├── routes.ts          # Route definitions
│       └── theme.ts           # Theme configuration
```

### 3. Enhanced Pages Structure

```
src/
├── pages/
│   ├── public/                # Public pages (no auth required)
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   └── Docs.tsx
│   ├── dashboard/             # Dashboard pages
│   │   ├── Dashboard.tsx
│   │   ├── Reports.tsx
│   │   └── Status.tsx
│   ├── diagnosis/             # Diagnosis pages
│   │   ├── Diagnosis.tsx
│   │   └── DiagnosisHistory.tsx
│   ├── forecast/              # Forecast pages
│   │   ├── Forecast.tsx
│   │   └── ForecastHistory.tsx
│   ├── auth/                  # Authentication pages (future)
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   └── index.ts               # Barrel exports
```

### 4. Assets and Static Files

```
src/
├── assets/                    # Static assets
│   ├── images/
│   │   ├── logos/
│   │   ├── icons/
│   │   └── illustrations/
│   ├── fonts/
│   └── data/                  # Static data files
│       ├── mock-diagnosis.json
│       └── mock-forecast.json
```

### 5. Complete Proposed Structure

```
src/
├── components/                # All React components
│   ├── ui/                   # Base UI components
│   ├── layout/               # Layout components
│   ├── features/             # Feature-specific components
│   ├── common/               # Shared components
│   └── index.ts
├── pages/                    # Page components
│   ├── public/
│   ├── dashboard/
│   ├── diagnosis/
│   ├── forecast/
│   ├── auth/
│   └── index.ts
├── lib/                      # Utilities and configurations
│   ├── api/
│   ├── utils/
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   └── config/
├── assets/                   # Static assets
│   ├── images/
│   ├── fonts/
│   └── data/
├── styles/                   # Global styles
│   ├── globals.css
│   ├── components.css
│   └── utilities.css
├── App.tsx                   # Main App component
├── main.tsx                  # Entry point
└── vite-env.d.ts            # Vite type definitions
```

## 🔄 Migration Strategy

### Phase 1: Reorganize Components (Low Risk)
1. Create `src/components/features/` directory
2. Move `diagnosis/` and `forecast/` to `features/`
3. Create `src/components/common/` for shared components
4. Add barrel exports (`index.ts` files)

### Phase 2: Enhance Library Structure (Medium Risk)
1. Create `src/lib/api/` directory
2. Move API-related files to appropriate subdirectories
3. Create `src/lib/types/` for better type organization
4. Add configuration files

### Phase 3: Reorganize Pages (Low Risk)
1. Create feature-based page directories
2. Move pages to appropriate directories
3. Update routing imports

### Phase 4: Add Assets and Styles (Low Risk)
1. Create `src/assets/` directory
2. Move static assets from `public/` to `src/assets/`
3. Organize global styles

## 📋 Benefits of Proposed Structure

### 1. **Scalability**
- Easy to add new features without cluttering
- Clear separation of concerns
- Barrel exports for clean imports

### 2. **Maintainability**
- Related files are grouped together
- Easy to find and modify components
- Consistent naming conventions

### 3. **Developer Experience**
- IntelliSense works better with organized imports
- Easier to onboard new developers
- Clear project structure

### 4. **Performance**
- Better tree-shaking with barrel exports
- Easier code splitting by feature
- Optimized bundle sizes

## 🛠️ Implementation Commands

### PowerShell Commands
```powershell
# Phase 1: Reorganize components
New-Item -ItemType Directory -Path "src\components\features" -Force
New-Item -ItemType Directory -Path "src\components\common" -Force
Move-Item -Path "src\components\diagnosis" -Destination "src\components\features\"
Move-Item -Path "src\components\forecast" -Destination "src\components\features\"

# Phase 2: Enhance library structure
New-Item -ItemType Directory -Path "src\lib\api" -Force
New-Item -ItemType Directory -Path "src\lib\types" -Force
New-Item -ItemType Directory -Path "src\lib\config" -Force
Move-Item -Path "src\lib\api.ts" -Destination "src\lib\api\client.ts"
Move-Item -Path "src\lib\types.ts" -Destination "src\lib\types\index.ts"

# Phase 3: Reorganize pages
New-Item -ItemType Directory -Path "src\pages\features" -Force
# Move pages as needed

# Phase 4: Add assets
New-Item -ItemType Directory -Path "src\assets\images" -Force
New-Item -ItemType Directory -Path "src\assets\fonts" -Force
New-Item -ItemType Directory -Path "src\assets\data" -Force
```

### Command Prompt Commands
```cmd
# Phase 1: Reorganize components
mkdir src\components\features
mkdir src\components\common
move src\components\diagnosis src\components\features\
move src\components\forecast src\components\features\

# Phase 2: Enhance library structure
mkdir src\lib\api
mkdir src\lib\types
mkdir src\lib\config
move src\lib\api.ts src\lib\api\client.ts
move src\lib\types.ts src\lib\types\index.ts

# Phase 3: Reorganize pages
mkdir src\pages\features
# Move pages as needed

# Phase 4: Add assets
mkdir src\assets\images
mkdir src\assets\fonts
mkdir src\assets\data
```

## 🎯 Next Steps

1. **Review and approve** the proposed structure
2. **Implement Phase 1** (component reorganization)
3. **Update imports** throughout the codebase
4. **Test thoroughly** to ensure nothing breaks
5. **Document changes** for team members

This structure will make the codebase more maintainable and scalable as the project grows, especially when adding the backend ML services in the monorepo.
