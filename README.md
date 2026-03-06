<div align="center">

# 🧬 Foresee

### AI-Powered Malaria Diagnosis & Outbreak Forecasting Platform

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

> **BE Final Year Major Project**
>
> *Diagnose Today. Predict Tomorrow.*

</div>

---

## 📸 Preview

<div align="center">

<img src="apps/web/public/preview.jpg" alt="Foresee — Landing Page" width="100%" />

<table>
<tr>
<td align="center" width="50%">
<img src="apps/web/public/preview1.jpg" alt="Diagnosis Dashboard" width="100%" />
<br/>
<sub><b>Diagnosis Dashboard</b></sub>
</td>
<td align="center" width="50%">
<img src="apps/web/public/preview2 (1).jpg" alt="Forecasting & Analytics" width="100%" />
<br/>
<sub><b>Forecasting & Analytics</b></sub>
</td>
</tr>
</table>

</div>

---

## 📋 Table of Contents

<details>
<summary>Click to expand</summary>

- [Preview](#-preview)
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Two-Stage Clinical Workflow](#-two-stage-clinical-workflow)
- [Machine Learning Models](#-machine-learning-models)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Docker](#-docker)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Database Schema](#-database-schema)
- [Frontend](#-frontend)
- [Performance](#-performance)
- [Project Structure](#-project-structure)
- [Limitations & Disclaimer](#%EF%B8%8F-limitations--disclaimer)
- [Team](#-team)
- [License](#-license)

</details>

---

## 🌟 Overview

**Foresee** is a full-stack AI/ML platform for malaria diagnostics and epidemiological risk assessment, built as a BE Final Year Major Project. It implements a clinically-modelled **two-stage detection workflow** combining:

- **Deep learning microscopy analysis** — CNN-based blood smear parasite detection (94.85% accuracy)
- **Epidemiological risk screening** — Random Forest model trained on DHS survey methodology
- **Outbreak forecasting** — ARIMA time-series predictions for regional case counts
- **OOD safety gating** — Autoencoder rejects non-medical images before diagnosis

The platform is purpose-built for endemic regions where skilled microscopists are scarce and rapid triage is critical. It provides **role-differentiated interfaces** for doctors, administrators, and patients under a unified web application.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔬 Diagnosis Engine
- 9-layer CNN trained on 27,558 NIH blood smear images
- Autoencoder gatekeeper rejects non-medical images
- DHS-based Random Forest risk screening
- AI-powered clinical guidance (LLM integration)

</td>
<td width="50%">

### 📈 Outbreak Forecasting
- ARIMA with STL seasonal decomposition
- 1–4 week ahead case count predictions
- 95% confidence intervals
- Regional hotspot probability scoring

</td>
</tr>
<tr>
<td width="50%">

### 🔒 Enterprise Security
- RS256 JWT + JWKS signature verification
- 7-layer file upload validation (magic bytes)
- Three-tier RBAC (patient / doctor / admin)
- Rate limiting, CORS strict allowlist, security headers

</td>
<td width="50%">

### 📊 Analytics & Reports
- Real-time dashboard with Recharts visualizations
- Interactive Leaflet maps for geospatial data
- PDF report generation (server + client side)
- Complete diagnosis history with admin overview

</td>
</tr>
</table>

---

## 🔬 Two-Stage Clinical Workflow

Inspired by WHO/CDC Integrated Vector Management (IVM) guidelines — separating population-level risk screening from diagnostic confirmation.

```
    Patient / Clinician
            │
            ▼
  ┌─────────────────────────────────────────────────────┐
  │  STAGE 1 — Epidemiological Risk Screening           │
  │                                                     │
  │  Input   Fever · Age · Sex · Region · Residence     │
  │          Slept Under Net · Anemia Level             │
  │  Model   DHS-based Random Forest                    │
  │  Output  Low / Medium / High Risk + Score           │
  │  Access  All authenticated users                    │
  └──────────────────────┬──────────────────────────────┘
                         │  High Risk → Doctor required
                         ▼
  ┌─────────────────────────────────────────────────────┐
  │  STAGE 2 — Diagnostic Confirmation                  │
  │                                                     │
  │  Input   Giemsa-stained blood smear (128×128 RGB)   │
  │  Guard   Autoencoder OOD filter (MSE threshold)     │
  │  Model   9-layer CNN (NIH Malaria Dataset)          │
  │  Output  Parasitized / Uninfected + Confidence %    │
  │  Access  Doctor / Admin only                        │
  └──────────────────────┬──────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────┐
  │  RESULTS                                            │
  │  ─ AI clinical guidance (Dr. Foresee)               │
  │  ─ Auto-saved to PostgreSQL                         │
  │  ─ Downloadable PDF report                          │
  │  ─ Dashboard analytics updated in real-time         │
  └─────────────────────────────────────────────────────┘
```

---

## 🤖 Machine Learning Models

### Model 1 — CNN Parasite Detector

> `malaria_cnn_full.h5` · TensorFlow 2.15 · 27,558 images

```
Input (128×128×3 RGB)
  → Conv2D(32) → MaxPool → Conv2D(64) → MaxPool → Conv2D(128) → MaxPool
  → Flatten → Dense(256, Dropout 0.5) → Dense(128)
  → Dense(1, Sigmoid) → Parasitized / Uninfected
```

| Metric | Value |
|:---|:---|
| Accuracy | **94.85%** |
| Precision | **95.6%** |
| Recall | **94.0%** |
| F1-Score | **94.8%** |
| Dataset | NIH Malaria Cell Images (13,779 + 13,779) |
| Training | Adam (lr=0.001), BCE loss, 80/10/10 split |

---

### Model 2 — DHS Risk Index Calculator

> `malaria_symptoms_dhs.pkl` · scikit-learn Random Forest

A **risk screener** (not a diagnostic tool) aligned with WHO/CDC stratification guidelines, trained on Demographic and Health Survey (DHS) epidemiological data.

| Input Feature | DHS Code | Type |
|:---|:---|:---|
| Fever (last 2 weeks) | `hc53` | Binary |
| Age in months | `hw1` | Integer |
| Sex | `hc27` | Categorical |
| Indian state/district | Region | Categorical |
| Rural / Urban | `hv025` | Categorical |
| Slept under bed net | `ml1` | Binary |
| Anemia level (1–4) | `hc57` | Ordinal |
| Interview month | `hv006` | Integer (seasonality) |

**Output:** Risk score (0–1) → Low (<0.33) / Medium (0.33–0.67) / High (≥0.67)

---

### Model 3 — Gatekeeper Autoencoder (OOD Detection)

> `gatekeeper_autoencoder.h5` · Convolutional Autoencoder

Trained exclusively on valid blood smear images. Rejects non-medical images (selfies, screenshots, etc.) **before** they reach the CNN — a critical safety layer.

```
Image → Encoder → Latent → Decoder → Reconstructed
                    ↓
          MSE(original, reconstructed)
          > threshold → REJECT (OOD)
          ≤ threshold → PASS to CNN
```

Threshold calibrated at the 99th percentile MSE of valid training images (stored in `models/metadata.json`).

---

### Model 4 — ARIMA Outbreak Forecaster

> `outbreak_forecaster.pkl` · statsmodels

Seasonal ARIMA with STL decomposition for 1–4 week ahead regional case count prediction, with 95% confidence intervals and hotspot probability scoring.

---

## 🏗️ System Architecture

```
┌──────────────────── CLIENT ─────────────────────┐
│        React 18 · Vite · Tailwind · Clerk       │
└────────────────────────┬────────────────────────┘
                         │ HTTPS + JWT Bearer
                         ▼
┌──────────────────── API LAYER ──────────────────┐
│           Flask 3.0 · Gunicorn · CORS           │
│                                                 │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐   │
│  │Gatekeep │  │ DHS Risk │  │    ARIMA      │   │
│  │ + CNN   │  │  Forest  │  │  Forecaster   │   │
│  └─────────┘  └──────────┘  └───────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Auth: RS256 JWKS · Rate Limit · RBAC    │   │
│  └──────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────┘
                         │ psycopg 3
                         ▼
┌──────────────────── DATABASE ───────────────────┐
│     Neon PostgreSQL · Prisma Schema Mgmt        │
└─────────────────────────────────────────────────┘
```

### Request Lifecycle

Every API request passes through 7 sequential layers:

1. **CORS** — strict origin allowlist (no wildcards, ever)
2. **Rate Limit** — per user-ID or IP, Redis (prod) / in-memory (dev)
3. **Auth** — JWT decode → RS256 JWKS verify → DB user check → URL param guard → RBAC
4. **Validation** — schema-driven field checks + file upload (extension, MIME, magic bytes, size)
5. **Business Logic** — ML inference / CRUD operations
6. **Security Headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`
7. **Audit Logging** — all 401/403/429 events logged with IP, user, path

---

## 🚀 Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### Backend
`apps/inference/`

- **Python 3.11** + Flask 3.0
- **TensorFlow 2.15** — CNN + Autoencoder
- **scikit-learn** — Random Forest
- **statsmodels** — ARIMA forecasting
- **psycopg 3** — PostgreSQL driver
- **PyJWT** — RS256 + JWKS auth
- **Flask-Limiter** — rate limiting
- **xhtml2pdf** — PDF generation
- **OpenCV / Pillow** — image processing
- **Gunicorn** — production WSGI

</td>
<td valign="top" width="33%">

### Frontend
`apps/web/`

- **React 18.3** + TypeScript 5.8
- **Vite 5.4** (SWC) — build tool
- **Tailwind CSS 3.4** — styling
- **shadcn/ui** — component library
- **TanStack Query 5** — server state
- **React Hook Form + Zod** — forms
- **Recharts** — charts & analytics
- **React Leaflet** — maps
- **Framer Motion** — animations
- **Clerk** — auth & sessions

</td>
<td valign="top" width="33%">

### Database
`apps/database/`

- **Neon PostgreSQL** — serverless DB
- **Prisma 6.19** — ORM + migrations
- **TypeScript** — typed services
- 3 tables: User, Diagnosis, Forecast

</td>
</tr>
</table>

---

## ⚡ Getting Started

### Prerequisites

- **Python 3.11+** and **pip**
- **Node.js 18+** and **npm** (or Bun)
- **PostgreSQL** (via [Neon](https://neon.tech/) recommended)
- **Clerk** account for authentication

### 1. Clone the repository

```bash
git clone https://github.com/HumayunK01/CodeRedProject.git
cd CodeRedProject
```

### 2. Database — generate client & run migrations

```bash
cd apps/database
npm install
cp .env.example .env          # add your Neon DATABASE_URL
npm run generate
npm run migrate
```

### 3. Inference — start the ML backend

```bash
cd apps/inference
python -m venv .venv
.venv\Scripts\activate         # Windows (use source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
cp .env.example .env           # add DATABASE_URL, CLERK keys, OPENROUTER_API_KEY
python flask_app.py            # runs on :8000
```

### 4. Web — start the frontend

```bash
cd apps/web
npm install
cp .env.example .env.local     # add VITE_INFER_BASE_URL, Clerk keys
npm run dev                    # runs on :8080
```

### Environment Variables

<details>
<summary><b>Inference</b> (<code>.env</code>)</summary>

| Variable | Description |
|:---|:---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend key (for JWKS URL) |
| `CLERK_SECRET_KEY` | Clerk Management API key |
| `OPENROUTER_API_KEY` | AI medical assistant LLM |
| `FRONTEND_URL` | Allowed CORS origin (production) |
| `ALLOWED_ORIGINS` | Additional CORS origins (comma-separated) |
| `DEFAULT_RATE_LIMIT` | Rate limit (default: `100/minute`) |
| `REDIS_URL` | Redis URL for rate limiting (optional) |

</details>

<details>
<summary><b>Web</b> (<code>.env.local</code>)</summary>

| Variable | Description |
|:---|:---|
| `VITE_INFER_BASE_URL` | Inference API URL (e.g. `http://localhost:8000`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_OPENROUTER_API_KEY` | OpenRouter key (chatbot) |

</details>

<details>
<summary><b>Database</b> (<code>.env</code>)</summary>

| Variable | Description |
|:---|:---|
| `DATABASE_URL` | Neon PostgreSQL connection string |

</details>

---

## 🐳 Docker

Run the entire stack (frontend + backend) with a single command.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed

### Quick Start

```bash
# 1. Copy the environment template and fill in your keys
cp .env.docker.example .env.docker

# 2. Build & start both services
docker compose --env-file .env.docker up --build
```

| Service | URL | Description |
|:--------|:----|:------------|
| **Web** | `http://localhost:8080` | React frontend (Nginx) |
| **Inference** | `http://localhost:8000` | Flask ML API (Gunicorn) |

The frontend's Nginx config reverse-proxies `/api/*` requests to the inference container, so the browser never needs direct access to port 8000.

### Useful Commands

```bash
# Start in background
docker compose --env-file .env.docker up -d --build

# View logs
docker compose logs -f            # all services
docker compose logs -f inference   # just the backend

# Rebuild a single service
docker compose --env-file .env.docker up --build inference

# Stop everything
docker compose down

# Stop and remove volumes (model cache)
docker compose down -v
```

---

## 📡 API Reference

All protected endpoints require `Authorization: Bearer <Clerk JWT>`.

<details>
<summary><b>Health & Status</b></summary>

```http
GET /health
```
No authentication. Returns system status, model versions, uptime.

</details>

<details>
<summary><b>Image Diagnosis</b> (Doctor/Admin only)</summary>

```http
POST /predict/image
Content-Type: multipart/form-data
```

**Validation pipeline:** extension → MIME → size (10MB) → magic bytes → OOD gatekeeper → CNN

```json
// Success
{ "label": "Parasitized", "confidence": 0.9542, "model_version": "v1.0", "inference_time_ms": 1847 }

// OOD Rejection
{ "error": "OOD_REJECTED", "message": "Image does not appear to be a valid blood smear.", "ood_score": 0.142 }
```

</details>

<details>
<summary><b>Symptom Risk Screening</b></summary>

```http
POST /predict/symptoms
Content-Type: application/json
```

```json
// Request
{ "fever": 1, "age_months": 36, "sex": "Male", "state": "Maharashtra",
  "residence_type": "Rural", "slept_under_net": 0, "anemia_level": 2, "interview_month": 3 }

// Response
{ "label": "High Risk", "risk_score": 0.87, "method": "DHS-based Random Forest",
  "recommendation": "Refer for microscopy confirmation" }
```

</details>

<details>
<summary><b>Outbreak Forecast</b></summary>

```http
POST /forecast/region
Content-Type: application/json
```

```json
// Request
{ "region": "Maharashtra", "horizon_weeks": 4 }

// Response
{ "region": "Maharashtra", "hotspot_score": 0.85,
  "predictions": [
    { "week": 1, "cases_predicted": 1250, "confidence_lower": 1100, "confidence_upper": 1400 }
  ]}
```

</details>

<details>
<summary><b>User Management</b></summary>

```http
POST   /api/users/sync                  # Upsert user after Clerk sign-in
GET    /api/users/<clerk_id>            # Get user profile + stats
GET    /api/users/<clerk_id>/activity   # Activity timeline
```

</details>

<details>
<summary><b>Diagnosis Records</b></summary>

```http
POST   /api/diagnoses                   # Create diagnosis record
GET    /api/diagnoses/<clerk_id>        # List user diagnoses
GET    /api/diagnoses/<clerk_id>/stats  # Aggregated statistics
```

</details>

<details>
<summary><b>Forecast Records</b></summary>

```http
POST   /api/forecasts                   # Create forecast record
GET    /api/forecasts/<clerk_id>        # List user forecasts
GET    /api/forecasts/<clerk_id>/stats  # Aggregated statistics
```

</details>

<details>
<summary><b>Admin Endpoints</b> (Admin role only)</summary>

```http
GET    /api/admin/users                 # List all Clerk users
PATCH  /api/admin/users/<id>/role       # Set role (admin / doctor / patient)
GET    /dashboard/stats                 # Global platform statistics
```

</details>

<details>
<summary><b>Error Codes</b></summary>

| Code | Meaning |
|:---|:---|
| `400` | Bad request / failed validation |
| `401` | Missing, expired, or forged JWT |
| `403` | Authenticated but insufficient role |
| `422` | Field-level validation failure |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

</details>

---

## 🔒 Security

Foresee implements **defence-in-depth** across 7 layers:

| Layer | What it does |
|:---|:---|
| **1. CORS** | Strict origin allowlist — **never** uses wildcard `*` |
| **2. Rate Limiting** | Per user-ID / IP, Redis (prod) or in-memory (dev) |
| **3. JWT Auth** | RS256 + JWKS verification → DB user check → URL param guard → RBAC |
| **4. File Upload** | 7-step validation: presence → name → extension → MIME → size → magic bytes → OOD |
| **5. Input Validation** | Schema-driven `validate_fields()` on all POST bodies |
| **6. Security Headers** | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **7. Audit Logging** | All 401/403/429 logged with method, path, IP, user_id |

### Role-Based Access Control

| Role | Capabilities |
|:---|:---|
| **patient** (default) | Risk screening, view own diagnoses & forecasts |
| **doctor** | + Image diagnostic (CNN + OOD), detailed results |
| **admin** | + User management, role assignment, global stats |

Roles are stored in **Clerk `publicMetadata`** and enforced both client-side (conditional UI rendering) and server-side (`@require_auth(roles=[...])` decorator with live Clerk Management API lookup).

---

## 🗄️ Database Schema

Managed by **Prisma 6.19** on **Neon PostgreSQL**.

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    User      │       │    Diagnosis     │       │   Forecast   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id       PK  │◄──┐   │ id           PK  │       │ id       PK  │
│ clerkId  UQ  │   ├── │ userId       FK  │   ┌── │ userId   FK  │
│ email    UQ  │   │   │ imageUrl         │   │   │ region       │
│ name         │   │   │ result           │   │   │ prediction   │
│ role         │   │   │ confidence       │   │   │ horizon      │
│ createdAt    │   │   │ patientAge       │   │   │ accuracy     │
│ updatedAt    │   │   │ patientSex       │   │   │ createdAt    │
└──────────────┘   │   │ location         │   │   └──────────────┘
                   │   │ symptoms  (JSON) │   │
                   │   │ diagnosisType    │   │
                   │   │ modelVersion     │   │
                   │   │ createdAt        │   │
                   │   └──────────────────┘   │
                   └──────────────────────────┘
```

---

## 🖥️ Frontend

### Routes

| Route | Page | Access |
|:---|:---|:---|
| `/` | Landing page | Public |
| `/diagnosis` | Two-stage assessment | Authenticated |
| `/forecast` | Outbreak predictions | Authenticated |
| `/reports` | Diagnosis history | Authenticated |
| `/dashboard` | Analytics & charts | Authenticated |
| `/admin` | User role management | Admin only |

### Architecture Highlights

- **TanStack Query v5** — server state with SWR, background refetch, optimistic updates
- **React Context** (`DbUserProvider`) — user + auth state across component tree
- **React Hook Form + Zod** — validated forms with type inference
- **Error Boundaries** — graceful recovery on render failures (no blank pages)
- **Dark / light mode** — system-aware theming via `next-themes`

---

## 📊 Performance

<table>
<tr>
<td width="50%">

### ML Models

| Model | Key Metric |
|:---|:---|
| CNN (Image) | **94.85%** accuracy |
| CNN Precision | **95.6%** |
| CNN Recall | **94.0%** |
| CNN F1-Score | **94.8%** |
| DHS Risk Index | **100%** stratification consistency |
| ARIMA Forecast | **80.2%** directional accuracy |

</td>
<td width="50%">

### System

| Metric | Value |
|:---|:---|
| CNN Inference | ~1.8s |
| Symptom Inference | <100ms |
| Lighthouse Score | 95 |
| Time to Interactive | 2.4s |
| First Contentful Paint | 1.2s |

</td>
</tr>
</table>

---

## 📁 Project Structure

```
CodeRedProject/
├── apps/
│   ├── web/                              # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── diagnosis/            # DualMode, SymptomsForm, ImageUploader
│   │   │   │   ├── forecast/             # ForecastForm, ForecastChart
│   │   │   │   ├── dashboard/            # Analytics widgets
│   │   │   │   ├── layout/               # MainLayout, Sidebar
│   │   │   │   ├── providers/            # DbUserProvider (auth context)
│   │   │   │   └── ui/                   # shadcn/ui components
│   │   │   ├── pages/                    # Home, Diagnosis, Forecast, Reports, Dashboard, Admin
│   │   │   ├── lib/                      # api.ts, types.ts, validations.ts, utils.ts
│   │   │   └── hooks/                    # Custom React hooks
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── inference/                        # Flask ML backend
│   │   ├── flask_app.py                  # Main app — routes, auth, ML inference
│   │   ├── db/
│   │   │   └── database.py              # PostgreSQL CRUD (psycopg 3)
│   │   ├── agents/
│   │   │   ├── live_data_agent.py       # Synthetic outbreak data generator
│   │   │   └── live_web_agent.py        # Weather + news risk signals
│   │   ├── models/                       # .h5 / .pkl model files + metadata.json
│   │   ├── scripts/                      # Training & data processing scripts
│   │   ├── notebooks/                    # Jupyter notebooks
│   │   ├── data/                         # Datasets (CSV, DHS)
│   │   ├── templates/                    # PDF report HTML template
│   │   ├── tests/                        # Test suite
│   │   └── requirements.txt
│   │
│   └── database/                         # Prisma data layer
│       ├── prisma/
│       │   ├── schema.prisma             # User, Diagnosis, Forecast tables
│       │   └── migrations/
│       └── src/
│           ├── lib/prisma.ts             # Prisma client singleton
│           ├── services/                 # Typed CRUD service classes
│           └── tests/                    # Integration tests
│
├── apps/README.md                        # Apps overview & architecture diagram
└── package.json                          # Monorepo root
```

---

## ⚠️ Limitations & Disclaimer

| # | Limitation |
|:---|:---|
| 1 | **Not a medical device** — outputs are decision-support only, requiring professional interpretation |
| 2 | **Image requirements** — requires Giemsa-stained thin blood smear images (100× oil-immersion magnification) |
| 3 | **Risk ≠ diagnosis** — Stage 1 estimates epidemiological risk, it does not detect parasites |
| 4 | **Regional scope** — forecasting models are trained on Indian epidemiological data |
| 5 | **Online required** — ML inference requires live connection to the Flask backend |

> **Medical Disclaimer:** Foresee is provided for research and educational purposes. It is NOT certified as a medical device and must not be used as the sole basis for clinical decisions. The developers assume no liability for medical decisions made using this tool.

---

## 👥 Team

<div align="center">

<table>
  <tr>
    <td align="center" width="33%">
      <a href="https://github.com/HumayunK01">
        <img src="https://github.com/HumayunK01.png" width="120px" style="border-radius: 50%;" alt="Humayun"/>
      </a>
      <br/>
      <strong>Khan Humayun Majid</strong>
      <br/>
      <sub>ML Engineering & Backend</sub>
      <br/>
      <sub>Model architecture · API design · Security</sub>
      <br/><br/>
      <a href="https://github.com/HumayunK01"><img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub"/></a>
      <a href="https://linkedin.com/in/devhumayun"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
    </td>
    <td align="center" width="33%">
      <a href="https://github.com/ZohaAnsari04">
        <img src="https://github.com/ZohaAnsari04.png" width="120px" style="border-radius: 50%;" alt="Zoha"/>
      </a>
      <br/>
      <strong>Ansari Zoha</strong>
      <br/>
      <sub>Frontend & UI/UX</sub>
      <br/>
      <sub>React · Design system · User experience</sub>
      <br/><br/>
      <a href="https://github.com/ZohaAnsari04"><img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub"/></a>
    </td>
    <td align="center" width="33%">
      <a href="https://github.com/addy1805">
        <img src="https://github.com/addy1805.png" width="120px" style="border-radius: 50%;" alt="Adnan"/>
      </a>
      <br/>
      <strong>Ansari Adnan</strong>
      <br/>
      <sub>Data Science</sub>
      <br/>
      <sub>Dataset curation · Model validation · Analytics</sub>
      <br/><br/>
      <a href="https://github.com/addy1805"><img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub"/></a>
    </td>
  </tr>
</table>

</div>

### Acknowledgments

- **[NIH Malaria Cell Images Dataset](https://lhncbc.nlm.nih.gov/LHC-downloads/downloads.html#malaria-datasets)** — 27,558 annotated blood smear images
- **[WHO Global Malaria Programme](https://www.who.int/teams/global-malaria-programme)** — epidemiological guidelines & DHS methodology
- **[Demographic and Health Surveys (DHS)](https://dhsprogram.com/)** — feature engineering & stratification reference

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**BE Final Year Major Project** · Built with ❤️ for global health equity

*Foresee Team — 2026*

[![GitHub](https://img.shields.io/badge/GitHub-HumayunK01%2FCodeRedProject-181717?style=for-the-badge&logo=github)](https://github.com/HumayunK01/CodeRedProject)

</div>
