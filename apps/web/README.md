<div align="center">

# 🌐 Foresee — Web Frontend

**The React-powered dashboard for malaria diagnosis, outbreak forecasting, and health reports.**

[![React](https://img.shields.io/badge/react-18.3-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/vite-5.4-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Clerk](https://img.shields.io/badge/clerk-auth-6c47ff?logo=clerk&logoColor=white)](https://clerk.com)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Pages & Routes](#-pages--routes)
- [Architecture](#-architecture)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Tech Stack](#-tech-stack)

---

## 🧠 Overview

This is the **frontend application** (`@foresee/web`) for the Foresee platform. It's a single-page React app that communicates with the [Flask inference server](../inference/README.md) for ML predictions and serves as the user-facing interface for all platform features.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🩸 **Malaria Diagnosis** | Upload blood smear images or enter symptoms for AI-powered analysis |
| 📈 **Outbreak Forecasting** | Predict disease outbreak trends for Indian states with interactive charts & maps |
| 📊 **Dashboard** | Personal stats, recent activity, and health metrics at a glance |
| 📄 **Reports** | View, filter, and export PDF lab reports |
| 🤖 **AI Chatbot** | "Dr. Foresee" — an AI health assistant powered by OpenRouter |
| 🗺️ **Interactive Maps** | Leaflet-based outbreak visualization with geolocation |
| 🔒 **Authentication** | Clerk-powered auth with role-based access (admin panel) |
| 🎨 **Animated UI** | Framer Motion page transitions, Locomotive Scroll, confetti effects |

---

## 📁 Folder Structure

```
web/src/
│
├── App.tsx                        🚀 Root component (routing, providers, layout)
├── main.tsx                       🔌 Entry point (ClerkProvider + StrictMode)
├── index.css                      🎨 Global styles + Tailwind directives
│
├── pages/                         📄 Route-level page components
│   ├── Home.tsx                   ── Landing page
│   ├── Dashboard.tsx              ── User dashboard
│   ├── Diagnosis.tsx              ── Malaria diagnosis (image + symptoms)
│   ├── Forecast.tsx               ── Outbreak forecasting
│   ├── Reports.tsx                ── Report history & export
│   ├── Status.tsx                 ── System health status
│   ├── Usecase.tsx                ── Use case showcase
│   ├── Admin.tsx                  ── Admin panel (user management)
│   └── NotFound.tsx               ── 404 page
│
├── components/
│   ├── dashboard/                 📊 Dashboard widgets
│   │   ├── ActionItem.tsx
│   │   ├── ActivityLogItem.tsx
│   │   ├── InfrastructureMetric.tsx
│   │   ├── MetricCard.tsx
│   │   └── UserStatsCard.tsx
│   │
│   ├── diagnosis/                 🩺 Diagnosis feature
│   │   ├── DualModeDiagnosis.tsx  ── Tab switcher (image vs symptoms)
│   │   ├── ImageUploader.tsx      ── Drag & drop blood smear upload
│   │   ├── SymptomsForm.tsx       ── Clinical symptom input form
│   │   ├── DiagnosisResults.tsx   ── Result display with confidence
│   │   └── DownloadReportButton.tsx ── PDF report generation
│   │
│   ├── forecast/                  📈 Forecasting feature
│   │   ├── ForecastForm.tsx       ── Region + horizon selector
│   │   ├── ForecastResults.tsx    ── Prediction summary
│   │   ├── ForecastChart.tsx      ── Basic Recharts line chart
│   │   ├── EnhancedForecastChart.tsx ── Advanced multi-series chart
│   │   └── ForecastMap.tsx        ── Leaflet outbreak heatmap
│   │
│   ├── home/                      🏠 Landing page sections
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Stats.tsx
│   │   ├── Testimonials.tsx
│   │   └── CTA.tsx
│   │
│   ├── layout/                    🖼️ App shell
│   │   ├── MainLayout.tsx         ── Page wrapper with navbar + footer
│   │   ├── Navbar.tsx             ── Navigation bar
│   │   ├── Footer.tsx             ── Site footer
│   │   └── DashboardContainer.tsx ── Dashboard page wrapper
│   │
│   ├── providers/                 🔗 React context providers
│   │   └── DbUserProvider.tsx     ── Auto-syncs Clerk user to database
│   │
│   ├── reports/                   📄 Reports feature
│   │   ├── ReportsList.tsx        ── Report history table
│   │   ├── ReportsFilters.tsx     ── Date/type/status filters
│   │   ├── ReportsStats.tsx       ── Summary statistics
│   │   ├── ReportsExport.tsx      ── Export actions
│   │   └── ResultCard.tsx         ── Individual result display
│   │
│   └── ui/                        🧱 Shared UI primitives (shadcn/ui)
│       ├── button.tsx, card.tsx, dialog.tsx, input.tsx ...
│       ├── chatbot.tsx            ── AI chatbot widget
│       ├── expandable-chat.tsx    ── Floating chat container
│       ├── preloader.tsx          ── Session-based loading animation
│       ├── confetti.tsx           ── Celebration effects
│       ├── sparkline.tsx          ── Mini inline charts
│       └── ... (60+ components)
│
├── hooks/                         🪝 Custom React hooks
│   ├── use-db-user.ts            ── Access synced database user
│   ├── use-diagnosis.ts          ── Diagnosis state & API calls
│   ├── use-forecast.ts           ── Forecast state & API calls
│   ├── use-location.tsx          ── Browser geolocation
│   ├── use-auto-scroll.ts        ── Chat auto-scroll behavior
│   ├── use-mobile.tsx            ── Mobile breakpoint detection
│   └── use-toast.ts              ── Toast notification system
│
├── lib/                           🔧 Utilities & services
│   ├── api.ts                    ── ApiClient (inference server calls)
│   ├── db.ts                     ── Frontend DB client (Flask API)
│   ├── chatbot.ts                ── OpenRouter AI chatbot service
│   ├── location.ts               ── LocationService (geolocation + geocoding)
│   ├── storage.ts                ── LocalStorage manager for offline results
│   ├── validations.ts            ── Zod schemas for form validation
│   ├── types.ts                  ── Shared TypeScript types
│   ├── prisma-types.ts           ── Prisma model type definitions
│   ├── constants.ts              ── Indian regions list
│   └── utils.ts                  ── cn() utility (clsx + tailwind-merge)
│
└── data/                          📦 Static data
    └── landing-page.ts           ── Feature cards content
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (or [Bun](https://bun.sh))
- **Foresee inference server** running at `localhost:8000` ([setup guide](../inference/README.md))
- **Clerk** account for authentication
- **OpenRouter** API key for the chatbot *(optional)*

### 1. Install dependencies

```bash
cd apps/web
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### 3. Start development server

```bash
npm run dev
```

Opens at **`http://localhost:8080`** with hot reload. API calls are proxied to `localhost:8000`.

### 4. Build for production

```bash
npm run build
npm run preview    # Preview the production build locally
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Required | Description |
|---|:---:|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key ([dashboard](https://dashboard.clerk.com)) |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `VITE_INFER_BASE_URL` | ✅ | Inference server URL (default: `http://localhost:8000`) |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `VITE_OPENROUTER_API_KEY` | — | OpenRouter API key for AI chatbot |
| `VITE_CHATBOT_MODEL` | — | Chat model (default: `openrouter/aurora-alpha`) |
| `VITE_APP_NAME` | — | App name (default: `Foresee`) |
| `VITE_INFER_TIMEOUT_MS` | — | API timeout in ms (default: `15000`) |
| `VITE_ENABLE_ANALYTICS` | — | Enable analytics (default: `false`) |

> **Note:** All `VITE_` prefixed variables are exposed to the browser. Never put secrets in `VITE_` variables.

---

## 🗺️ Pages & Routes

| Route | Page | Auth | Description |
|---|---|:---:|---|
| `/` | Home | — | Landing page with hero, features, stats |
| `/dashboard` | Dashboard | 🔒 | Personal stats, activity log, quick actions |
| `/diagnosis` | Diagnosis | 🔒 | Image upload + symptom analysis |
| `/forecast` | Forecast | 🔒 | Region-based outbreak prediction |
| `/reports` | Reports | 🔒 | History, filters, PDF export |
| `/status` | Status | — | System health & API status |
| `/usecase` | Usecase | — | Use case showcase |
| `/admin` | Admin | 👑 | User management (admin only) |
| `*` | NotFound | — | 404 catch-all |

> 🔒 = Requires Clerk sign-in &nbsp;&nbsp; 👑 = Requires admin role

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                    Browser                      │
│                                                 │
│  ClerkProvider → DbUserProvider → MainLayout    │
│       │              │               │          │
│  Auth state    Auto-sync user    Navbar/Footer  │
│       │         to backend           │          │
│       ▼              ▼               ▼          │
│  ┌─────────┐  ┌──────────┐  ┌──────────────┐    │
│  │  Pages  │  │  Hooks   │  │  Components  │    │
│  │ (routes)│──│ (state)  │──│  (UI layer)  │    │
│  └────┬────┘  └────┬─────┘  └──────────────┘    │
│       │             │                           │
│       ▼             ▼                           │
│  ┌──────────────────────┐                       │
│  │      lib/ services   │                       │
│  │  api.ts  db.ts  ...  │                       │
│  └──────────┬───────────┘                       │
│             │                                   │
└─────────────┼───────────────────────────────────┘
              │ HTTP (Bearer JWT)
              ▼
     Flask Inference Server
      (localhost:8000)
```

**Data flow:**
1. **Clerk** handles auth → provides JWT tokens
2. **DbUserProvider** auto-syncs Clerk user to the backend database on sign-in
3. **Hooks** (`use-diagnosis`, `use-forecast`) manage feature state and call **lib/api.ts** + **lib/db.ts**
4. **API calls** go to the Flask inference server with Clerk JWT as Bearer token
5. **Components** render results with charts (Recharts), maps (Leaflet), and animations (Framer Motion)

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at `:8080` with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run build:dev` | Development build (unminified) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking (no emit) |

---

## 🚢 Deployment

### Vercel (recommended)

The project includes [vercel.json](vercel.json) with SPA rewrites configured:

1. Connect your GitHub repo on [Vercel](https://vercel.com)
2. Set root directory to `apps/web`
3. Framework preset: **Vite**
4. Add environment variables from `.env.example`
5. Deploy 🚀

### Manual / Other platforms

```bash
npm run build
# Serve the dist/ folder with any static file server
# Ensure all routes rewrite to index.html (SPA)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript 5.8 |
| **Build Tool** | Vite 5.4 (SWC) |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui (60+ components) |
| **Routing** | React Router v6 |
| **State** | TanStack Query (server state) + React hooks (local state) |
| **Auth** | Clerk (React SDK) |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **Maps** | Leaflet + react-leaflet |
| **Animations** | Framer Motion + Locomotive Scroll |
| **AI Chat** | OpenRouter API |
| **Icons** | Lucide React |
| **HTTP** | Fetch API with JWT auth |

---

<div align="center">

**Part of the [Foresee](https://github.com/HumayunK01/CodeRedProject) platform** · BE Final Year Major Project

</div>
