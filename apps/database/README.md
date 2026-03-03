<div align="center">

# 🗄️ Foresee — Database Package

**Prisma-powered data layer for the Foresee platform.**

[![TypeScript](https://img.shields.io/badge/typescript-5.8-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/prisma-6.19-2d3748?logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/postgresql-neon-336791?logo=postgresql&logoColor=white)](https://neon.tech)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Schema](#-schema)
- [Services](#-services)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)

---

## 🧠 Overview

This is the **shared database package** (`@foresee/database`) for the Foresee platform. It provides:

- **Prisma schema** defining all models, enums, and relations
- **Service classes** with typed CRUD operations, filtering, pagination, and stats
- **Singleton Prisma client** with global caching for development HMR

The package is designed to be consumed by other apps in the monorepo (the Flask inference server uses its own direct PostgreSQL layer via psycopg).

---

## 📁 Folder Structure

```
database/
│
├── prisma/
│   ├── schema.prisma          📐 Data models, enums & relations
│   └── migrations/            📦 Migration history
│
├── src/
│   ├── index.ts               🚀 Barrel export (services, types, client)
│   ├── lib/
│   │   └── prisma.ts          🔌 Singleton PrismaClient instance
│   ├── services/
│   │   ├── user.service.ts    👤 User CRUD + Clerk sync + stats
│   │   ├── diagnosis.service.ts 🩺 Diagnosis CRUD + ML result helper
│   │   ├── forecast.service.ts  📈 Forecast CRUD + active/risk queries
│   │   └── report.service.ts   📄 Report CRUD + publish/archive workflow
│   └── tests/
│       ├── test-services.ts   🧪 Integration test for all services
│       └── verify-prisma.ts   🔍 Quick Prisma connection check
│
├── prisma.config.ts           ⚙️  Prisma engine & datasource config
├── tsconfig.json              📝 TypeScript compiler options
├── package.json               📦 Package config & scripts
├── .env.example               🔑 Environment variable template
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** database — we use [Neon](https://neon.tech) (serverless Postgres)

### 1. Install dependencies

```bash
cd apps/database
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your Neon connection string
```

### 3. Generate Prisma Client

```bash
npm run generate
```

### 4. Run migrations

```bash
# Development (creates migration + applies)
npm run migrate

# Production (applies pending migrations only)
npm run migrate:deploy
```

### 5. Verify connection

```bash
npm run verify
```

---

## 📐 Schema

The database has **5 models** and **5 enums**:

### Models

| Model | Purpose | Key Fields |
|---|---|---|
| **User** | Clerk-synced user accounts | `clerkId`, `email`, `firstName`, `lastName`, `imageUrl` |
| **Diagnosis** | Malaria diagnosis results | `result`, `confidence`, `species`, `parasiteCount`, `symptoms`, `imageUrl` |
| **Forecast** | Outbreak predictions | `region`, `country`, `riskLevel`, `casesLow/High/Mean`, weather data |
| **Report** | Generated PDF reports | `title`, `type`, `status`, `content` (JSON), `publishedAt` |
| **SystemLog** | Application-level logs | `level`, `service`, `message`, `metadata` |

### Enums

| Enum | Values |
|---|---|
| `PatientSex` | `male`, `female`, `other`, `unknown` |
| `RiskLevel` | `low`, `medium`, `high`, `critical` |
| `ReportType` | `diagnosis`, `forecast`, `outbreak`, `surveillance`, `custom` |
| `ReportStatus` | `draft`, `pending`, `published`, `archived` |
| `LogLevel` | `debug`, `info`, `warn`, `error`, `fatal` |

### Relations

```
User ──┬── has many ──► Diagnosis
       ├── has many ──► Forecast
       └── has many ──► Report

(All relations cascade on delete)
```

---

## 🔧 Services

Each model has a dedicated service class with static methods:

### UserService

| Method | Description |
|---|---|
| `create(data)` | Create a new user |
| `findByClerkId(clerkId)` | Find user by Clerk ID |
| `findByEmail(email)` | Find user by email |
| `findByClerkIdWithStats(clerkId)` | Find user with diagnosis/forecast/report counts |
| `upsert(data)` | Create or update user (Clerk sync) |
| `updateByClerkId(clerkId, data)` | Update user fields |
| `deleteByClerkId(clerkId)` | Delete user |
| `findAll(options?)` | Paginated user list |
| `count()` | Total user count |
| `exists(clerkId)` | Check if user exists |

### DiagnosisService

| Method | Description |
|---|---|
| `create(data)` | Create diagnosis record |
| `findById(id)` | Find by ID |
| `findByUserId(userId, options?)` | User's diagnoses (paginated) |
| `findWithFilters(filters, options?)` | Filtered + paginated query |
| `update(id, userId, data)` | Update diagnosis |
| `delete(id, userId)` | Delete diagnosis |
| `getStatsByUserId(userId)` | Stats: total, positive, negative, last date |
| `getRecentByUserId(userId, limit?)` | Most recent diagnoses |
| `createFromMLResult(userId, imageUrl, mlResult, metadata?)` | Create from ML prediction output |

### ForecastService

| Method | Description |
|---|---|
| `create(data)` | Create forecast record |
| `findByUserId(userId, options?)` | User's forecasts (paginated) |
| `findWithFilters(filters, options?)` | Filtered + paginated query |
| `getActiveForecasts(userId?, limit?)` | Forecasts where `endDate > now` |
| `getHighRiskCount(userId?)` | Count of high/critical risk forecasts |
| `getStatsByUserId(userId)` | Stats: total, active, high-risk, last date |
| `createFromMLResult(userId, region, horizonWeeks, mlResult, metadata?)` | Create from ML forecast output |

### ReportService

| Method | Description |
|---|---|
| `create(data)` | Create report |
| `findByUserId(userId, options?)` | User's reports (paginated) |
| `publish(id, userId)` | Set status to `published` + timestamp |
| `archive(id, userId)` | Set status to `archived` |
| `delete(id, userId)` | Delete report |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run generate` | Generate Prisma Client from schema |
| `npm run migrate` | Create + apply a new migration (dev) |
| `npm run migrate:deploy` | Apply pending migrations (production) |
| `npm run push` | Push schema changes without migration (prototyping) |
| `npm run studio` | Open Prisma Studio (visual DB editor) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run dev` | Watch mode TypeScript compilation |
| `npm run verify` | Quick Prisma connection test |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (direct) |
| `DATABASE_URL_POOLED` | — | Pooled connection for serverless/edge |

**Neon connection string format:**
```
postgresql://[user]:[password]@[endpoint].region.aws.neon.tech/[database]?sslmode=require
```

Get yours from [console.neon.tech](https://console.neon.tech) → Connection Details.

---

## 📦 Usage

### Importing in other packages

```typescript
import {
  prisma,
  UserService,
  DiagnosisService,
  ForecastService,
  ReportService,
} from "@foresee/database";

// Create a user
const user = await UserService.upsert({
  clerkId: "clerk_abc123",
  email: "user@example.com",
  firstName: "Jane",
});

// Save a diagnosis from ML result
const diagnosis = await DiagnosisService.createFromMLResult(
  user.id,
  "https://storage.example.com/image.jpg",
  { result: "positive", confidence: 0.97, species: "P. falciparum" }
);

// Get user stats
const stats = await UserService.findByClerkIdWithStats("clerk_abc123");
console.log(stats._count);
// → { diagnoses: 5, forecasts: 3, reports: 2 }
```

### Direct Prisma access

```typescript
import { prisma } from "@foresee/database";

const recentDiagnoses = await prisma.diagnosis.findMany({
  where: { result: "positive" },
  orderBy: { createdAt: "desc" },
  take: 10,
});
```

---

<div align="center">

**Part of the [Foresee](https://github.com/HumayunK01/CodeRedProject) platform** · Built for the CodeRed Hackathon

</div>
