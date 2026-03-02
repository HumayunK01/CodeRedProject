<div align="center">

# 🧬 Foresee

### AI/ML-Driven Malaria Diagnosis & Outbreak Forecasting Platform

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/HumayunK01/CodeRedProject)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)](#)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.2-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/flask-3.0-black.svg)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/tensorflow-2.15-ff6f00.svg)](https://tensorflow.org/)

**Diagnose Today. Predict Tomorrow.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Two-Stage Clinical Workflow](#-two-stage-clinical-workflow)
- [Machine Learning Models](#-machine-learning-models)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [API Reference](#-api-reference)
- [Security Architecture](#-security-architecture)
- [Database Schema](#-database-schema)
- [Frontend Application](#-frontend-application)
- [Role-Based Access Control](#-role-based-access-control)
- [Out-of-Distribution (OOD) Detection](#-out-of-distribution-ood-detection)
- [Outbreak Forecasting Engine](#-outbreak-forecasting-engine)
- [AI Medical Assistant](#-ai-medical-assistant)
- [Performance Metrics](#-performance-metrics)
- [Project Structure](#-project-structure)
- [Limitations & Disclaimer](#-limitations--disclaimer)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

**Foresee** is a full-stack, production-grade AI/ML platform for malaria diagnostics and epidemiological risk assessment. It implements a clinically modelled two-stage detection workflow, combining deep learning-based microscopy image analysis with a machine-learning-based epidemiological risk screener derived from Demographic and Health Survey (DHS) methodology.

The platform is purpose-built for endemic regions where skilled microscopists are scarce and rapid triage is critical. It provides healthcare professionals (doctors), administrators, and patients with a role-differentiated interface under a unified web application.

### Core Capabilities at a Glance

| Capability | Method | Status |
|---|---|---|
| Blood smear parasite detection | CNN (TensorFlow/Keras, 27,558 images) | ✅ Production |
| Epidemiological risk stratification | Random Forest (DHS-aligned features) | ✅ Production |
| OOD / gatekeeper image rejection | Convolutional Autoencoder (MSE threshold) | ✅ Production |
| Outbreak forecasting | ARIMA time-series with STL decomposition | ✅ Production |
| Role-based user management | Clerk Management API + JWT RBAC | ✅ Production |
| PDF report generation | xhtml2pdf (backend) + jsPDF (frontend) | ✅ Production |
| AI clinical assistant | OpenRouter API (LLM integration) | ✅ Production |
| Authentication | Clerk RS256 JWT + JWKS verification | ✅ Production |

---

## 🔬 Two-Stage Clinical Workflow

Foresee implements a two-stage protocol inspired by the WHO/CDC Integrated Vector Management (IVM) and RTS,S/AS01 trial workflow, separating risk screening from diagnostic confirmation.

```
Patient / Clinician
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  STAGE 1 — Epidemiological Risk Screening               │
│  (Accessible to all authenticated users)                 │
│                                                          │
│  Input: Fever, Age, Sex, Region, Residence Type,        │
│         Slept Under Net, Anemia Level                   │
│                                                          │
│  Model: DHS-based Random Forest Risk Index Calculator   │
│                                                          │
│  Output: Low / Medium / High Risk + Risk Score          │
│  Purpose: Population-level triage, NOT diagnosis        │
└──────────────────────────────────────────────────────────┘
        │
        │  (If HIGH RISK — Doctor role required)
        ▼
┌──────────────────────────────────────────────────────────┐
│  STAGE 2 — Diagnostic Confirmation                      │
│  (Doctor role only)                                      │
│                                                          │
│  Input: High-resolution Giemsa-stained blood smear      │
│         microscopy image (128×128 RGB)                   │
│                                                          │
│  Gatekeeper: Autoencoder OOD filter (MSE < threshold)  │
│  ↓ Only valid blood smears pass through                 │
│                                                          │
│  Model: CNN (9-layer architecture, NIH dataset)         │
│                                                          │
│  Output: Parasitized / Uninfected + Confidence %        │
│  Purpose: Parasite detection, clinical use              │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  RESULTS & REPORTING                                    │
│  ─ Results panel with AI clinical guidance              │
│  ─ Automatically saved to Neon PostgreSQL               │
│  ─ Downloadable PDF clinical report                     │
│  ─ Dashboard analytics updated in real-time            │
└──────────────────────────────────────────────────────────┘
```

---

## 🤖 Machine Learning Models

### Model 1 — CNN Diagnostic Model (`malaria_cnn_full.h5`)

A **nine-layer convolutional neural network** trained on the full NIH Malaria Dataset for binary classification of Giemsa-stained thin blood smear images.

**Architecture:**
```
Input (128×128×3 RGB)
  │
  ├── Conv2D(32, 3×3, ReLU) → MaxPooling2D(2×2)
  ├── Conv2D(64, 3×3, ReLU) → MaxPooling2D(2×2)
  ├── Conv2D(128, 3×3, ReLU) → MaxPooling2D(2×2)
  │
  ├── Flatten
  ├── Dense(256, ReLU) → Dropout(0.5)
  ├── Dense(128, ReLU)
  │
  └── Dense(1, Sigmoid) → Binary Output
       Parasitized (>0.5) / Uninfected (≤0.5)
```

**Training Details:**
- **Dataset**: NIH Malaria Cell Images Dataset — 27,558 images (13,779 Parasitized + 13,779 Uninfected)
- **Train/Val/Test Split**: 80% / 10% / 10%
- **Optimizer**: Adam (lr=0.001)
- **Loss**: Binary Cross-Entropy
- **Image Preprocessing**: Resize to 128×128, normalize pixel values to [0,1], data augmentation (horizontal flip, rotation, zoom)
- **Framework**: TensorFlow 2.15 / Keras

**Production Metrics:**

| Metric | Value |
|--------|-------|
| Accuracy | **94.85%** |
| Precision | **95.6%** |
| Recall | **94.0%** |
| F1-Score | **94.8%** |
| Inference Time | ~1.8s |

---

### Model 2 — DHS Risk Index Calculator (`malaria_symptoms_dhs.pkl`)

A **Random Forest** classifier trained on DHS (Demographic and Health Survey) epidemiological data to compute a Clinical Risk Index for malaria likelihood, aligned with WHO/CDC stratification guidelines.

**This is explicitly a risk screener, not a diagnostic tool.**

**Input Features (DHS-aligned indicators):**

| Feature | DHS Code | Type | Description |
|---------|----------|------|-------------|
| `fever` | `hc53` | Binary (0/1) | Fever in last 2 weeks |
| `age_months` | `hw1` | Integer | Child age in months |
| `sex` | `hc27` | Categorical | Male / Female / Other |
| `state` | Region | Categorical | Indian state/district |
| `residence_type` | `hv025` | Categorical | Rural / Urban |
| `slept_under_net` | `ml1` | Binary (0/1) | Slept under ITN last night |
| `anemia_level` | `hc57` | Ordinal (1–4) | 1=Severe, 2=Moderate, 3=Mild, 4=None |
| `interview_month` | `hv006` | Integer (1–12) | Month of assessment (seasonality) |

**Output:**
```json
{
  "label": "High Risk",
  "risk_score": 0.87,
  "method": "DHS-based Random Forest",
  "recommendation": "Refer for microscopy confirmation",
  "model_version": "v1.0"
}
```

**Risk Stratification Levels:**
- **Low Risk** (score < 0.33): Routine monitoring recommended
- **Medium Risk** (0.33 ≤ score < 0.67): Preventive measures, follow-up
- **High Risk** (score ≥ 0.67): Immediate microscopy confirmation required

---

### Model 3 — Gatekeeper Autoencoder (`gatekeeper_autoencoder.h5`)

A **convolutional autoencoder** trained exclusively on valid Giemsa-stained blood smear images. It acts as an Out-of-Distribution (OOD) detector — rejecting any non-blood-smear image before it reaches the CNN classifier.

**Architecture:**
```
Encoder:
  Input (128×128×3)
  → Conv2D(32, ReLU) → MaxPooling2D
  → Conv2D(64, ReLU) → MaxPooling2D
  → Conv2D(128, ReLU) → MaxPooling2D
  → Latent Representation

Decoder:
  → Conv2DTranspose(128, ReLU) → UpSampling2D
  → Conv2DTranspose(64, ReLU)  → UpSampling2D
  → Conv2DTranspose(32, ReLU)  → UpSampling2D
  → Conv2D(3, Sigmoid) → Reconstructed Image (128×128×3)
```

**OOD Decision Logic:**
```
MSE(original, reconstructed) > gatekeeper_threshold
        → REJECT: "Image not recognized as a blood smear"
        → Return HTTP 400 with OOD error message

MSE(original, reconstructed) ≤ gatekeeper_threshold
        → PASS: Forward to CNN classifier
        → Return prediction result
```

The `gatekeeper_threshold` is loaded from `models/metadata.json` at startup (default: `0.05`) and is calibrated during training to achieve near-zero false negative rate on valid blood smears.

---

### Model 4 — ARIMA Forecast Model (`malaria_forecast_arima.pkl`)

A **Seasonal ARIMA** model (`statsmodels`) pre-trained on historical malaria case surveillance data for regional outbreak prediction.

**Capabilities:**
- 1–4 week ahead case count forecasting
- Seasonal decomposition (STL) to separate trend, seasonality, and residuals
- Confidence interval generation (upper/lower bounds)
- District/region-level outbreak probability scoring

---

## 🏗️ System Architecture

```
┌─────────────────────── CLIENT LAYER ────────────────────────────┐
│  Browser (React PWA)       Mobile (Responsive PWA)             │
└─────────────────────────────────┬───────────────────────────────┘
                                  │  HTTPS + JWT Bearer
        ┌─────────────────────────┼──────────────────────┐
        │                         │                       │
        ▼                         ▼                       ▼
  ┌──────────┐           ┌────────────────┐      ┌───────────────┐
  │  Clerk   │           │   Flask API    │      │  Neon (PG)    │
  │  Auth    │◄──────────│  (Python 3.9) │◄────►│  PostgreSQL   │
  │  (JWT)   │  JWKS     │  Port 8000    │      │  via Prisma   │
  └──────────┘  RS256    └───────┬────────┘      └───────────────┘
                                 │
              ┌──────────────────┼─────────────────────┐
              │                  │                      │
              ▼                  ▼                      ▼
     ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
     │  Gatekeeper  │  │  DHS Risk Index  │  │  ARIMA Forecast  │
     │  Autoencoder │  │  Random Forest   │  │  Model           │
     │      +       │  │  (.pkl)          │  │  (.pkl)          │
     │  CNN Model   │  └──────────────────┘  └──────────────────┘
     │  (.h5)       │
     └──────────────┘
              │
              ▼
     ┌──────────────────┐
     │  OpenRouter API  │
     │  (AI Medical     │
     │   Assistant)     │
     └──────────────────┘
```

### Request Lifecycle

```
Client Request
  │
  ├─ [1] CORS Preflight Check (enforce_cors hook)
  │       Origin validated against ALLOWED_ORIGINS allowlist
  │       Wildcard (*) never used
  │
  ├─ [2] Rate Limiter (Flask-Limiter)
  │       Key: Clerk user_id (from JWT) OR IP address
  │       Storage: Redis (prod) / in-memory (dev)
  │       Strategy: Fixed-window
  │
  ├─ [3] require_auth Decorator
  │       Step 1: JWT base64 decode → extract sub + exp
  │       Step 2: RS256 JWKS signature verification (Clerk JWKS endpoint)
  │       Step 3: DB user existence check (fallback if JWKS unavailable)
  │       Step 4: URL parameter guard (clerk_id injection prevention)
  │       Step 5: RBAC role check via Clerk Management API (if roles specified)
  │
  ├─ [4] Input Validation (validate_fields helper)
  │       Schema-driven: required fields, types, lengths, allowed values
  │       File uploads: extension + MIME + magic bytes + size limit
  │
  ├─ [5] Business Logic / ML Inference
  │
  ├─ [6] Security Headers (after_request hook)
  │       X-Content-Type-Options: nosniff
  │       X-Frame-Options: DENY
  │       Referrer-Policy: strict-origin-when-cross-origin
  │       Permissions-Policy: camera=(), microphone=(), geolocation=()
  │
  └─ [7] Security Event Logging (after_request hook)
          Logs all 401 / 403 / 429 with method, path, IP, user_id
```

---

## 🚀 Technology Stack

### Backend — `apps/inference/`

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.9+ | Runtime |
| **Flask** | 3.0 | WSGI web framework |
| **Flask-CORS** | 4.x | Cross-origin resource sharing with strict allowlist |
| **Flask-Limiter** | 3.x | Rate limiting with Redis/in-memory storage |
| **TensorFlow** | 2.15 | CNN + Autoencoder model training & inference |
| **Keras** | (bundled) | High-level neural network API |
| **scikit-learn** | latest | Random Forest (DHS model), joblib serialization |
| **statsmodels** | latest | ARIMA time-series forecasting |
| **NumPy** | latest | Array operations, image normalization |
| **Pandas** | latest | Tabular data manipulation |
| **Pillow (PIL)** | latest | Image loading and preprocessing |
| **OpenCV (cv2)** | latest | Advanced computer vision operations |
| **PyJWT** | 2.x | JWT decoding and RS256 signature verification |
| **python-dotenv** | latest | Environment variable management |
| **psycopg** | 3.x | PostgreSQL async driver |
| **xhtml2pdf** | latest | Server-side PDF generation |
| **Werkzeug ProxyFix** | (bundled) | Trust reverse proxy X-Forwarded-For headers |
| **redis** | latest | Rate limiter backend (production) |

### Frontend — `apps/web/`

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.2 | UI component framework |
| **TypeScript** | 5.0 | Static typing |
| **Vite** | 5.0 | Build tool and dev server |
| **React Router DOM** | 6.x | Client-side routing |
| **TanStack Query** | 5.x | Server state management, caching, background re-fetching |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework |
| **shadcn/ui** | latest | Accessible Radix-based component library |
| **Framer Motion** | latest | Declarative animations and layout transitions |
| **Recharts** | latest | Composable chart library for analytics dashboard |
| **React Leaflet** | latest | Interactive maps for geospatial visualization |
| **React Hook Form** | 7.x | Performant form state management |
| **Zod** | 3.x | TypeScript-first schema validation |
| **@hookform/resolvers** | latest | React Hook Form + Zod integration |
| **Clerk (clerk-react)** | latest | Authentication, session management, user metadata |
| **jsPDF** | latest | Client-side PDF report generation |
| **Lucide React** | latest | Icon library |
| **next-themes** | latest | Dark/light mode theme management |
| **date-fns** | latest | Date formatting utilities |
| **@radix-ui** | latest | Accessible primitive components (used by shadcn/ui) |

### Database — `apps/database/`

| Technology | Version | Purpose |
|---|---|---|
| **Neon PostgreSQL** | 14+ | Serverless PostgreSQL with connection pooling |
| **Prisma ORM** | 5.x | Type-safe database client, schema management, migrations |
| **@prisma/client** | 5.x | Auto-generated TypeScript client |

---

## 📡 API Reference

All protected endpoints require:
```
Authorization: Bearer <Clerk JWT>
```

### Health & Status

```http
GET /health
```
Returns system health, model versions, and uptime. No authentication required.

```json
{
  "status": "healthy",
  "message": "Foresee API is running",
  "model_accuracy": "94.85%",
  "timestamp": "2026-03-02T12:00:00Z"
}
```

---

### Image Diagnostic Endpoint

```http
POST /predict/image
Content-Type: multipart/form-data
Authorization: Bearer <JWT>
```

**File Validation Layers (in order):**
1. File extension check (`.jpg`, `.jpeg`, `.png` only)
2. MIME type check (`Content-Type` header)
3. File size limit (max 10MB)
4. Magic bytes check (validates actual file bytes against known image headers: `FFD8FF` for JPEG, `89504E47` for PNG — prevents format forgery)
5. Gatekeeper OOD check (autoencoder MSE threshold)
6. CNN inference

**Response (valid blood smear):**
```json
{
  "label": "Parasitized",
  "confidence": 0.9542,
  "model_version": "v1.0",
  "inference_time_ms": 1847
}
```

**Response (OOD rejection):**
```json
{
  "error": "OOD_REJECTED",
  "message": "Image does not appear to be a valid blood smear microscopy image.",
  "ood_score": 0.142
}
```

---

### Symptom Risk Screening Endpoint

```http
POST /predict/symptoms
Content-Type: application/json
Authorization: Bearer <JWT>
```

**Request Body:**
```json
{
  "fever": 1,
  "age_months": 36,
  "sex": "Male",
  "state": "Maharashtra",
  "residence_type": "Rural",
  "slept_under_net": 0,
  "anemia_level": 2,
  "interview_month": 3
}
```

**Input Validation Schema (server-side):**
- `fever`: integer, in `[0, 1]`
- `age_months`: integer, min 1, max 1440
- `sex`: string, allowed: `["Male", "Female", "Other"]`
- `residence_type`: string, allowed: `["Rural", "Urban"]`
- `anemia_level`: integer, in `[1, 2, 3, 4]`

**Response:**
```json
{
  "label": "High Risk",
  "risk_score": 0.87,
  "confidence": 0.87,
  "method": "DHS-based Random Forest",
  "recommendation": "Refer for microscopy confirmation",
  "model_version": "v1.0"
}
```

---

### Outbreak Forecast Endpoint

```http
POST /forecast/region
Content-Type: application/json
Authorization: Bearer <JWT>
```

**Request:**
```json
{
  "region": "Maharashtra",
  "horizon_weeks": 4
}
```

**Response:**
```json
{
  "region": "Maharashtra",
  "predictions": [
    { "week": 1, "cases_predicted": 1250, "confidence_lower": 1100, "confidence_upper": 1400 },
    { "week": 2, "cases_predicted": 1380, "confidence_lower": 1200, "confidence_upper": 1560 }
  ],
  "hotspot_score": 0.85,
  "model_accuracy": 0.802
}
```

---

### User Management Endpoints

```http
POST   /api/users/sync            # Upsert user in DB after Clerk sign-in
GET    /api/users/<clerk_id>      # Get user profile + stats
GET    /api/users/<clerk_id>/activity  # Get activity timeline
```

### Diagnosis Record Endpoints

```http
POST   /api/diagnoses             # Create diagnosis record
GET    /api/diagnoses/<clerk_id>  # List user diagnoses
GET    /api/diagnoses/<clerk_id>/stats  # Aggregated diagnosis statistics
```

### Forecast Record Endpoints

```http
POST   /api/forecasts             # Create forecast record
GET    /api/forecasts/<clerk_id>  # List user forecasts
GET    /api/forecasts/<clerk_id>/stats  # Aggregated forecast statistics
```

### Admin Endpoints (Admin role only)

```http
GET    /api/admin/users           # List all Clerk users
PATCH  /api/admin/users/<id>/role # Set user role (admin / doctor / patient)
GET    /dashboard/stats           # Global platform statistics
```

---

### Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": "Error type",
  "message": "Human-readable description"
}
```

| Status Code | Meaning |
|---|---|
| `400` | Bad Request — invalid input or failed validation |
| `401` | Unauthorized — missing, malformed, expired, or forged JWT |
| `403` | Forbidden — authenticated but insufficient role |
| `422` | Unprocessable Entity — field-level validation failure |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |

---

## 🔒 Security Architecture

Foresee implements a defence-in-depth security model across seven layers.

### Layer 1 — CORS Strict Allowlist

The API **never** uses wildcard (`*`) CORS. All allowed origins are explicitly enumerated:

```python
DEFAULT_DEV_ORIGINS = [
    "http://localhost:5173", "http://localhost:8080", ...
]
# Plus FRONTEND_URL and ALLOWED_ORIGINS from environment variables
ALLOWED_ORIGINS = _build_allowed_origins()  # deduplicated list
```

The `enforce_cors` after-request hook reflects the exact allowed origin back (required for credentialed requests — browsers reject wildcard with credentials=true).

### Layer 2 — Rate Limiting

**Flask-Limiter** enforces request rate limits per authenticated user (or IP as fallback):

```
Rate limit key: f"user:{clerk_user_id}"  (if JWT present)
                f"ip:{remote_address}"   (anonymous fallback)

Default limit:  100 requests / minute   (configurable via DEFAULT_RATE_LIMIT env)
ML endpoints:   Stricter limits applied per endpoint decorator

Storage:
  ├── Production: Redis (persistent, shared across workers)
  └── Development: In-memory (automatic fallback if Redis unreachable)
```

Rate limit headers are exposed to clients:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

### Layer 3 — JWT Authentication (RS256 + JWKS)

Every protected endpoint runs the `require_auth` decorator with a 5-step validation pipeline:

```
Step 1: Extract JWT payload
        → base64url decode header + payload
        → Validate presence of "sub" (user_id) and "exp" (expiry)
        → Reject expired tokens immediately

Step 2: RS256 Signature Verification (JWKS)
        → Fetch Clerk's public key JSON Web Key Set (JWKS endpoint)
        → Match token's "kid" (Key ID) to the correct public key
        → Cryptographically verify the signature using PyJWT
        → Reject tokens with invalid signatures (tampered / forged)
        → JWKS URL derived from CLERK_PUBLISHABLE_KEY (instance-specific)
        → Cache JWKS in-memory, refresh on kid mismatch

Step 3: Database User Validation
        → Confirm the user exists in our Neon PostgreSQL database
        → Prevents valid Clerk tokens from any Clerk app accessing our API

Step 4: URL Parameter Guard
        → Ensure clerk_id URL params match the authenticated user's sub
        → Prevents horizontal privilege escalation (IDOR attacks)

Step 5: RBAC Role Check
        → For role-restricted endpoints, fetch caller's publicMetadata from
          Clerk Management API (fresh — not cached in JWT claims)
        → Reject if caller's role is not in the allowed roles list
```

### Layer 4 — File Upload Security (7-Layer Validation)

The `/predict/image` endpoint validates uploaded files through seven sequential checks:

```
Check 1: File presence         → Reject if no file in request
Check 2: Filename exists       → Reject empty filenames
Check 3: Extension allowlist   → .jpg / .jpeg / .png only
Check 4: MIME type header      → image/jpeg, image/png only
Check 5: File size limit       → max 10MB (10 × 1024 × 1024 bytes)
Check 6: Magic bytes           → Read first 8 bytes, match against:
                                  FFD8FF....  → JPEG
                                  89504E470D0A1A0A → PNG
                                  Rejects renamed executables, PDFs, etc.
Check 7: OOD gatekeeper        → Autoencoder MSE threshold
```

### Layer 5 — Input Validation (Schema-Driven)

A reusable `validate_fields(data, schema)` helper enforces field-level constraints on all POST request bodies. A descriptive `ValidationError` is raised on the first failure and returned as a `422` response.

**Schema capabilities:**
- `required`: Reject missing fields
- `type`: Python type enforcement (`int`, `str`, `bool`, `float`)
- `min_length` / `max_length`: String length bounds
- `min_value` / `max_value`: Numeric range bounds
- `allowed`: Enum-style allowed value lists

Applied to: `POST /api/users/sync`, `POST /api/diagnoses`, `POST /api/forecasts`

### Layer 6 — Security Response Headers

An `after_request` hook appends hardening headers to **every** API response:

```
X-Content-Type-Options:  nosniff
X-Frame-Options:         DENY
Referrer-Policy:         strict-origin-when-cross-origin
Permissions-Policy:      camera=(), microphone=(), geolocation=()
```

### Layer 7 — Security Event Logging

A second `after_request` hook logs authentication and rate-limit events to stdout (captured by Railway/server log aggregators):

```
[security] HTTP 401 | POST /predict/image | IP: 1.2.3.4 | user: unauthenticated
[security] HTTP 403 | GET /api/admin/users | IP: 5.6.7.8 | user: user_2abc123
[security] HTTP 429 | POST /predict/image | IP: 9.10.11.12 | user: user_2def456
```

### Frontend Security

- **Zod schema validation** on all form inputs before submission
- **Error Boundaries** (`DiagnosisErrorBoundary`) wrap all ML result-rendering components — unhandled render errors show a recovery UI instead of a blank page
- **Clerk session management** — JWTs are short-lived, automatically refreshed
- **No PHI in localStorage** — only metadata and non-identifying result summaries stored locally

---

## 🗄️ Database Schema

Managed by **Prisma ORM** against **Neon PostgreSQL**.

### Tables

**`User`**
```
id          String   (cuid)       Primary key
clerkId     String   (unique)     Clerk user ID (sub)
email       String   (unique)
name        String?
role        String   default "patient"
createdAt   DateTime
updatedAt   DateTime
```

**`Diagnosis`**
```
id              String    (cuid)
userId          String    → FK User.id
imageUrl        String?   (base64 or filename)
result          String    ("Parasitized" / "Uninfected" / risk label)
confidence      Float
patientAge      Int?
patientSex      String?
location        String?
symptoms        Json?     (fever, slept_under_net, anemia_level)
modelVersion    String?
diagnosisType   String    ("image" / "symptoms")
createdAt       DateTime
```

**`Forecast`**
```
id          String    (cuid)
userId      String    → FK User.id
region      String
prediction  Json      (weekly predictions array)
horizon     Int       (weeks)
accuracy    Float?
createdAt   DateTime
```

---

## 🖥️ Frontend Application

### Pages & Routing

| Route | Page | Access |
|---|---|---|
| `/` | Home (Landing) | Public |
| `/diagnosis` | Assessment (Stage 1 + 2) | Authenticated |
| `/forecast` | Outbreak Forecasting | Authenticated |
| `/reports` | Diagnosis History | Authenticated |
| `/dashboard` | Analytics Dashboard | Authenticated |
| `/admin` | User Role Management | Admin only |

### State Management

- **TanStack Query v5** — all server state (user data, diagnoses, forecasts) with automatic background refetching, optimistic updates, and stale-while-revalidate
- **React Context** (`DbUserProvider`) — distributes authenticated user object and Clerk ID throughout the component tree
- **React Hook Form + Zod** — all form state with client-side validation before API calls

### Key Components

```
src/components/
├── diagnosis/
│   ├── DualModeDiagnosis.tsx    # Tab switcher: Risk Screening vs Image Analysis
│   ├── SymptomsForm.tsx         # Stage 1 form (DHS feature collection)
│   ├── ImageUploader.tsx        # Stage 2 drag-and-drop image uploader
│   ├── DiagnosisResults.tsx     # Results panel with AI guidance
│   └── DownloadReportButton.tsx # PDF report generator
├── forecast/
│   ├── ForecastForm.tsx         # Region + horizon selection
│   └── ForecastChart.tsx        # Recharts line chart with confidence bands
├── layout/
│   ├── MainLayout.tsx           # App shell (sidebar + topbar)
│   └── Sidebar.tsx              # Role-aware navigation
├── providers/
│   └── DbUserProvider.tsx       # Auth + DB user context
└── ui/
    ├── clinical-advisory.tsx    # Medical disclaimer banner
    └── [shadcn/ui components]   # Button, Card, Dialog, Toast, etc.
```

### Frontend Validation (Zod Schemas)

```typescript
// Symptoms form schema
symptomsSchema = z.object({
  fever: z.boolean(),
  sex: z.enum(["Male", "Female", "Other"]),
  region: z.string().min(1),
  residence_type: z.enum(["Rural", "Urban"]),
  slept_under_net: z.boolean(),
  age: z.number().min(0).max(120),
  anemia_level: z.enum(["None", "Mild", "Moderate", "Severe"]),
})

// Image upload schema
imageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= 10 * 1024 * 1024, "Max 10MB")
    .refine(f => ["image/jpeg","image/png"].includes(f.type), "JPEG/PNG only")
})
```

### Error Boundaries

`DiagnosisErrorBoundary` (class component) wraps both `DualModeDiagnosis` and `DiagnosisResults`. On any unhandled render error (e.g. missing `results.method` field for image diagnosis, malformed API response), it renders a recovery card instead of unmounting the entire page:

```
⚠️  Something went wrong
    An unexpected error occurred during analysis. Your data is safe — please try again.
    [Try Again]  ← Resets error state (no page refresh needed)
```

---

## 👤 Role-Based Access Control

Foresee implements three-tier RBAC via **Clerk publicMetadata** + **backend enforcement**.

| Role | Capabilities |
|---|---|
| **patient** (default) | Stage 1 risk screening, view own diagnoses and forecasts |
| **doctor** | All patient capabilities + Stage 2 image diagnostic (CNN + OOD) |
| **admin** | All doctor capabilities + user management, role assignment, global dashboard stats |

**Role Assignment Flow:**
```
Admin navigates to /admin
  → Frontend fetches all Clerk users via GET /api/admin/users
  → Admin selects user and new role
  → Frontend sends PATCH /api/admin/users/<clerk_id>/role
  → Backend verifies caller is admin via _get_caller_role()
  → PATCH to Clerk Management API: /users/<id>/metadata
      body: { "public_metadata": { "role": "doctor" } }
  → Clerk propagates role into future JWTs (publicMetadata claim)
  → User sees updated capabilities on next session refresh
```

**Frontend enforcement:**
```typescript
// DualModeDiagnosis.tsx
const isDoctor = user?.publicMetadata?.role === "doctor";
// Only renders the image upload tab and tab switcher if doctor
```

**Backend enforcement:**
```python
@app.route("/predict/image", methods=["POST"])
@require_auth(roles=["doctor", "admin"])  # Enforced server-side
def predict_image():
    ...
```

---

## 🛡️ Out-of-Distribution (OOD) Detection

A critical safety feature that prevents the CNN classifier from producing meaningless results on arbitrary images (e.g., photos of people, landscapes, screenshots).

**Training:**
- Autoencoder trained exclusively on NIH Malaria Dataset blood smear images
- Learns to reconstruct valid blood smears with low MSE
- Non-blood-smear images have high reconstruction error (poor reconstruction)

**At Inference:**
```python
reconstructed = gatekeeper_model.predict(img_array)
mse = np.mean(np.square(img_array - reconstructed))
if mse > gatekeeper_threshold:
    # OOD — reject before CNN sees it
    return {"error": "OOD_REJECTED", "ood_score": float(mse)}, 400
else:
    # Valid blood smear — proceed to CNN
    prediction = malaria_model.predict(img_array)
```

**Threshold calibration:**
The `gatekeeper_threshold` is stored in `models/metadata.json` and loaded at startup. It is set during training to the 99th percentile of MSE values computed on the full valid blood smear training set, ensuring near-zero false negatives on real blood smears while rejecting OOD inputs.

---

## 📈 Outbreak Forecasting Engine

The forecasting system uses **ARIMA** (AutoRegressive Integrated Moving Average) with seasonal decomposition to predict regional malaria case counts.

**Data Pipeline:**
```
Historical case surveillance data (CSV)
  → STL decomposition (trend + seasonality + residual)
  → ARIMA(p, d, q) model fitting (auto parameter selection via AIC)
  → Serialized with joblib → malaria_forecast_arima.pkl
```

**At inference:**
```
Region + Horizon input
  → Load pre-trained ARIMA model
  → Generate h-step ahead predictions
  → Compute 95% confidence intervals
  → Calculate hotspot score (normalized outbreak probability)
  → Return structured JSON with weekly forecasts
```

**Forecast output structure:**
- Weekly case count predictions (1–4 week horizon)
- Upper/lower confidence bounds at 95% level
- Regional hotspot probability score (0–1)

---

## 🤖 AI Medical Assistant

An LLM-powered clinical guidance assistant integrated into the results panel.

**Provider:** OpenRouter API (model routing across multiple LLM providers)

**Trigger:** Automatically fires after a diagnosis result is received (`useEffect` on `results` state change in `DiagnosisResults.tsx`)

**Context sent to LLM:**
- Diagnosis result label and confidence
- Whether image or symptom-based assessment
- Patient epidemiological indicators (if symptom-based)

**Output:** Free-text clinical guidance formatted in markdown, rendered with `**bold**` support, displayed in the "Dr. Foresee's Guidance" panel.

**Error handling:** If the API call fails (e.g., 404 from OpenRouter), the guidance panel is silently omitted — the rest of the results display normally.

---

## 📊 Performance Metrics

### ML Model Performance

| Model | Metric | Value |
|---|---|---|
| **CNN (Image Diagnostic)** | Accuracy | **94.85%** |
| | Precision | **95.6%** |
| | Recall | **94.0%** |
| | F1-Score | **94.8%** |
| | Dataset Size | 27,558 images (NIH Malaria) |
| **DHS Risk Index** | Approach | Random Forest Risk Calculator |
| | Risk Stratification Consistency | **100%** (vs. clinical rules) |
| | Use Case | Screening only (non-diagnostic) |
| **ARIMA (Forecast)** | MAE (4-week horizon) | 12.3% |
| | RMSE | 15.7% |
| | Directional Accuracy | 80.2% |

### System Performance

| Metric | Value |
|---|---|
| Average API Response Time | ~1.8s |
| CNN Inference Time | ~1.8s |
| Symptom Model Inference Time | < 100ms |
| Lighthouse Score | 95 |
| Time to Interactive | 2.4s |
| First Contentful Paint | 1.2s |

---

## 📁 Project Structure

```
CodeRedProject/
├── apps/
│   ├── web/                              # React Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── diagnosis/
│   │   │   │   │   ├── DualModeDiagnosis.tsx
│   │   │   │   │   ├── SymptomsForm.tsx
│   │   │   │   │   ├── ImageUploader.tsx
│   │   │   │   │   ├── DiagnosisResults.tsx
│   │   │   │   │   └── DownloadReportButton.tsx
│   │   │   │   ├── forecast/
│   │   │   │   ├── layout/
│   │   │   │   ├── providers/
│   │   │   │   │   └── DbUserProvider.tsx
│   │   │   │   └── ui/
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Diagnosis.tsx         # Error boundary + 2-column layout
│   │   │   │   ├── Forecast.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── Admin.tsx
│   │   │   ├── lib/
│   │   │   │   ├── api.ts               # Typed API client
│   │   │   │   ├── chatbot.ts           # OpenRouter integration
│   │   │   │   ├── constants.ts         # INDIA_REGIONS (deduplicated)
│   │   │   │   ├── db.ts                # DiagnosisService / ForecastService
│   │   │   │   ├── storage.ts           # StorageManager (localStorage)
│   │   │   │   ├── types.ts             # DiagnosisResult, SymptomsInput, etc.
│   │   │   │   ├── utils.ts
│   │   │   │   └── validations.ts       # Zod schemas
│   │   │   ├── hooks/
│   │   │   └── App.tsx                  # Router + AnimatePresence
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── inference/                        # Flask ML Backend
│   │   ├── flask_app.py                 # Main application (1800+ lines)
│   │   ├── database.py                  # Neon PostgreSQL functions
│   │   ├── models/
│   │   │   ├── malaria_cnn_full.h5     # Production CNN
│   │   │   ├── gatekeeper_autoencoder.h5  # OOD detector
│   │   │   ├── malaria_symptoms_dhs.pkl   # DHS Risk Index
│   │   │   ├── malaria_forecast_arima.pkl # ARIMA model
│   │   │   └── metadata.json            # Model accuracy + thresholds
│   │   └── requirements.txt
│   │
│   └── database/                        # Prisma Layer
│       ├── prisma/
│       │   ├── schema.prisma            # DB schema (User, Diagnosis, Forecast)
│       │   └── migrations/
│       └── src/                         # Prisma client wrapper
│
└── package.json                         # Monorepo scripts
```

---

## ⚠️ Limitations & Disclaimer

1. **Not a Diagnostic Device**: Foresee is a **clinical decision support tool**. All outputs must be interpreted by qualified healthcare professionals. Results do not constitute a medical diagnosis.

2. **Image Requirements**: The CNN model requires **Giemsa-stained thin blood smear** images taken under at least 100× oil-immersion magnification. Poor focus, low lighting, or non-blood-smear images will be rejected by the gatekeeper or yield unreliable results.

3. **Risk Screening ≠ Diagnosis**: The Stage 1 DHS-based model estimates epidemiological risk factors. It does not detect parasites and must not be used as a standalone diagnostic answer.

4. **Regional Scope**: Forecasting models are trained on Indian epidemiological data and are optimized for Indian endemic zones. Generalization to other geographies requires retraining.

5. **Offline Limitations**: While the frontend is a PWA, ML inference requires a live connection to the Flask backend.

---

## 👥 Team

<div align="center">

<table>
  <tr>
    <td align="center" width="33%">
      <img src="https://github.com/HumayunK01.png" width="100px" style="border-radius: 50%"><br>
      <strong>Khan Humayun Majid</strong><br>
      <em>ML Engineering & Backend</em><br>
      <sub>Model architecture, API, security hardening</sub><br>
      <a href="https://github.com/HumayunK01">GitHub</a> •
      <a href="https://linkedin.com/in/devhumayun">LinkedIn</a>
    </td>
    <td align="center" width="33%">
      <img src="https://github.com/ZohaAnsari04.png" width="100px" style="border-radius: 50%"><br>
      <strong>Ansari Zoha</strong><br>
      <em>Frontend & UI/UX</em><br>
      <sub>React, design system, user experience</sub><br>
      <a href="https://github.com/ZohaAnsari04">GitHub</a>
    </td>
    <td align="center" width="33%">
      <img src="https://github.com/addy1805.png" width="100px" style="border-radius: 50%"><br>
      <strong>Ansari Adnan</strong><br>
      <em>Data Science</em><br>
      <sub>Dataset curation, model validation, analytics</sub><br>
      <a href="https://github.com/addy1805">GitHub</a>
    </td>
  </tr>
</table>

</div>

### Acknowledgments

- **NIH Malaria Cell Images Dataset** — 27,558 annotated blood smear images
- **WHO Global Malaria Programme** — epidemiological guidelines and DHS methodology reference
- **Demographic and Health Surveys (DHS) Program** — feature and stratification methodology

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

> **Medical Disclaimer**: Foresee is provided for research and educational purposes. It is NOT certified as a medical device and must not be used as the sole basis for clinical decisions. The developers assume no liability for medical decisions made using this tool.

---

<div align="center">

**Built with ❤️ for global health equity**

*Foresee Team — 2026*

[![GitHub](https://img.shields.io/badge/GitHub-HumayunK01/CodeRedProject-black?logo=github)](https://github.com/HumayunK01/CodeRedProject)

</div>