<div align="center">

# 🔬 Foresee — Inference Server

**The AI/ML backend powering malaria diagnosis, symptom risk analysis, and outbreak forecasting.**

[![Python](https://img.shields.io/badge/python-3.11-3776ab?logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/flask-3.0-000000?logo=flask)](https://flask.palletsprojects.com)
[![TensorFlow](https://img.shields.io/badge/tensorflow--cpu-2.15-ff6f00?logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-latest-f7931e?logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![PostgreSQL](https://img.shields.io/badge/postgresql-neon-336791?logo=postgresql&logoColor=white)](https://neon.tech)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [ML Models](#-ml-models)
- [Scripts](#-scripts)
- [Datasets](#-datasets-not-included)
- [Deployment](#-deployment)
- [Tech Stack](#-tech-stack)

---

## 🧠 Overview

This is the **inference server** for the Foresee platform. It serves three core ML capabilities through a Flask REST API:

| Capability | What it does | Model |
|---|---|---|
| 🩸 **Malaria Cell Detection** | Classifies blood smear images as Parasitized / Uninfected | CNN (TensorFlow) |
| 📊 **Symptom Risk Analysis** | Computes malaria risk score from clinical symptoms | Random Forest (scikit-learn) |
| 📈 **Outbreak Forecasting** | Predicts weekly case counts for Indian states | Gradient Boosting Regressor |

It also handles **user auth** (Clerk JWT), **database CRUD** (PostgreSQL via psycopg), **PDF report generation** (xhtml2pdf), and **live data enrichment** (weather + news risk signals).

---

## 📁 Folder Structure

```
inference/
│
├── flask_app.py               🚀 Main Flask application (entry point)
│
├── agents/                    🤖 Runtime data-fetching agents
│   ├── live_data_agent.py     ── Generates synthetic outbreak data for Indian states
│   └── live_web_agent.py      ── Fetches live weather (Open-Meteo) & news (Google RSS)
│
├── api/                       🧪 Experimental FastAPI alternative (not deployed)
│   └── app.py
│
├── db/                        🗄️  Database layer
│   └── database.py            ── PostgreSQL CRUD (users, diagnoses, forecasts, reports)
│
├── scripts/                   🔧 Training & preprocessing scripts
│   ├── build_kb.py            ── Build TF-IDF FAQ knowledge base
│   ├── export_malaria_model.py── Train DHS symptom model (legacy)
│   ├── investigate_dhs_targets.py ── Explore DHS dataset columns
│   ├── process_outbreak_data.py   ── Convert COVID CSV → weekly time series
│   ├── retrain_cnn_full.py    ── Train full CNN on 27k cell images
│   ├── train_forecaster.py    ── Train outbreak forecasting model
│   ├── train_gatekeeper.py    ── Train autoencoder for OOD image rejection
│   └── train_risk_index_model.py  ── Train balanced risk index calculator
│
├── tests/                     🧪 Tests
│   └── test_cells.py          ── Quick cell image edge-detection validation
│
├── data/                      📂 Datasets (see note below)
│   ├── *.csv                  ── COVID-19 time series, dengue features, outbreak data
│   ├── cell_images/           ── NIH malaria cell images (gitignored)
│   └── dhs/                   ── DHS India survey data (gitignored, private)
│
├── models/                    🧠 Trained model artifacts
│   ├── malaria_cnn_full.h5    ── CNN for cell classification
│   ├── gatekeeper_autoencoder.h5 ── Autoencoder for OOD rejection
│   ├── outbreak_forecaster.pkl── Gradient boosting forecaster
│   ├── malaria_symptoms_dhs.pkl ── DHS-based risk calculator (Random Forest)
│   ├── tfidf_vectorizer.joblib── FAQ vectorizer
│   ├── tfidf_matrix.joblib    ── FAQ TF-IDF matrix
│   ├── answers.joblib         ── FAQ answer corpus
│   └── metadata.json          ── Model metadata & thresholds
│
├── notebooks/                 📓 Jupyter exploration notebooks
├── templates/                 📄 HTML templates
│   └── report.html            ── PDF lab report template (xhtml2pdf)
│
├── Dockerfile                 🐳 Multi-stage Docker build
├── Procfile                   ☁️  Heroku/Railway process declaration
├── nixpacks.toml              📦 Nixpacks build config (Railway)
├── Aptfile                    📦 System-level dependencies
├── requirements.txt           📦 Python dependencies
└── .env.example               🔑 Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **PostgreSQL** database (we use [Neon](https://neon.tech))
- **Clerk** account for authentication ([clerk.com](https://clerk.com))
- **Redis** *(optional, for production rate limiting)*

### 1. Clone & navigate

```bash
git clone https://github.com/HumayunK01/CodeRedProject.git
cd CodeRedProject/apps/inference
```

### 2. Create virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual values (see Environment Variables below)
```

### 5. Run the server

```bash
# Development
python flask_app.py

# Production
gunicorn flask_app:app --bind 0.0.0.0:8000 --workers 2 --timeout 120
```

The server starts at **`http://localhost:8000`** — hit `/health` to verify.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon recommended) |
| `FLASK_SECRET_KEY` | ✅ | Random hex string for session security (`python -c "import secrets; print(secrets.token_hex(32))"`) |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key (from dashboard → API Keys) |
| `CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `FRONTEND_URL` | ✅ | Production frontend URL for CORS |
| `PORT` | — | Server port (default: `8000`) |
| `REDIS_URL` | — | Redis URL for distributed rate limiting |
| `DEFAULT_RATE_LIMIT` | — | Rate limit string (default: `"100 per minute"`) |
| `ALLOWED_ORIGINS` | — | Extra CORS origins, comma-separated |
| `DEBUG` | — | `True`/`False` (default: `False`) |

> **Note:** Dev origins (`localhost:5173`, `localhost:3000`, etc.) are trusted automatically. You only need `FRONTEND_URL` for production.

---

## 🌐 API Endpoints

### Health & Info

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Server info |
| `GET` | `/health` | Health check with model status |
| `GET` | `/dashboard/stats` | Performance metrics & model stats |

### Authentication & Users

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/users/sync` | 🔒 | Sync Clerk user to database |
| `GET` | `/api/users/<clerk_id>/stats` | 🔒 | User statistics |
| `GET` | `/api/activity/<clerk_id>` | 🔒 | Recent user activity |

### ML Predictions

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/predict/image` | 🔒 | Blood smear image → malaria classification |
| `POST` | `/predict/symptoms` | 🔒 | Symptom data → risk score |
| `GET` | `/forecast/regions` | — | List available forecast regions |
| `POST` | `/forecast/region` | 🔒 | Region → weekly outbreak forecast |

### Data & Reports

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/diagnoses` | 🔒 | Save diagnosis record |
| `GET` | `/api/diagnoses/<clerk_id>` | 🔒 | User's diagnosis history |
| `GET` | `/api/diagnoses/<clerk_id>/stats` | 🔒 | Diagnosis statistics |
| `POST` | `/api/forecasts` | 🔒 | Save forecast record |
| `GET` | `/api/forecasts/<clerk_id>` | 🔒 | User's forecast history |
| `GET` | `/api/forecasts/<clerk_id>/stats` | 🔒 | Forecast statistics |
| `POST` | `/api/generate_report` | 🔒 | Generate PDF lab report |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/admin/users` | 👑 Admin | List all users (Clerk API) |
| `POST` | `/admin/set-role` | 👑 Admin | Set user role |

> 🔒 = Requires Clerk JWT &nbsp;&nbsp; 👑 = Requires admin role

---

## 🧠 ML Models

### 1. Malaria Cell Classifier (CNN)

- **File:** `models/malaria_cnn_full.h5`
- **Architecture:** 3 conv blocks + BatchNorm + Dropout → Dense
- **Input:** 64×64 RGB blood smear image
- **Output:** Parasitized (malaria positive) / Uninfected
- **Training script:** `scripts/retrain_cnn_full.py`

### 2. Gatekeeper Autoencoder (OOD Rejection)

- **File:** `models/gatekeeper_autoencoder.h5`
- **Purpose:** Rejects non-blood-smear images before CNN classification
- **Method:** Convolutional autoencoder — high reconstruction error = out-of-distribution
- **Training script:** `scripts/train_gatekeeper.py`

### 3. Outbreak Forecaster

- **File:** `models/outbreak_forecaster.pkl`
- **Algorithm:** `HistGradientBoostingRegressor` (scikit-learn)
- **Input:** 8-week sliding window of case counts
- **Output:** Predicted cases for next 1–12 weeks
- **Training scripts:** `scripts/train_forecaster.py`, `agents/live_data_agent.py`

### 4. Symptom Risk Calculator

- **File:** `models/malaria_symptoms_dhs.pkl`
- **Algorithm:** `RandomForestClassifier` trained on DHS India survey data
- **Input:** Fever, age, state, residence type, bed net usage, anemia level, season
- **Output:** Low / Medium / High risk classification
- **Training script:** `scripts/train_risk_index_model.py`

### 5. FAQ Knowledge Base

- **Files:** `models/tfidf_vectorizer.joblib`, `models/tfidf_matrix.joblib`, `models/answers.joblib`
- **Method:** TF-IDF cosine similarity
- **Training script:** `scripts/build_kb.py`

---

## 🔧 Scripts

All training and preprocessing scripts live in `scripts/`. Run them from the **inference root**:

```bash
cd apps/inference

# Preprocess COVID data into weekly time series
python -m scripts.process_outbreak_data

# Train the outbreak forecasting model
python -m scripts.train_forecaster

# Train the full CNN on cell images
python -m scripts.retrain_cnn_full

# Train the gatekeeper autoencoder
python -m scripts.train_gatekeeper

# Train DHS-based risk index model
python -m scripts.train_risk_index_model

# Build FAQ knowledge base
python -m scripts.build_kb

# Generate synthetic live data + retrain forecaster
python -m agents.live_data_agent
```

---

## 📂 Datasets (Not Included)

> **⚠️ Datasets are NOT included in this repository** due to size and licensing constraints.
> You must obtain them separately to train models or run preprocessing scripts.

### Required Datasets

| Dataset | Location | Size | Source | License |
|---|---|---|---|---|
| **NIH Malaria Cell Images** | `data/cell_images/` | ~350 MB (27,558 images) | [Kaggle](https://www.kaggle.com/datasets/iarunava/cell-images-for-detecting-malaria) / [NIH](https://lhncbc.nlm.nih.gov/LHC-downloads/downloads.html#malaria-datasets) | Public domain |
| **DHS India Survey (IAKR7E)** | `data/dhs/india/raw/` | ~150 MB | [DHS Program](https://dhsprogram.com/) | Requires registration & approval |
| **COVID-19 Time Series** | `data/time_series_covid_19_*.csv` | ~50 MB | [JHU CSSE](https://github.com/CSSEGISandData/COVID-19) | CC BY 4.0 |
| **Dengue Features** | `data/dengue_features_*.csv` | ~2 MB | [DrivenData](https://www.drivendata.org/competitions/44/dengai-predicting-disease-spread/) | Competition dataset |

### How to set up datasets

1. **Cell images** — Download from Kaggle, extract into `data/cell_images/` so you have `Parasitized/` and `Uninfected/` subdirectories
2. **DHS data** — Register at [dhsprogram.com](https://dhsprogram.com), request India IAKR7E dataset, place `.DTA` files in `data/dhs/india/raw/`
3. **COVID-19 CSVs** — Already included as processed files in `data/`. Raw time series can be refreshed from JHU CSSE GitHub
4. **Run preprocessing:**
   ```bash
   python -m scripts.process_outbreak_data
   ```

> **Tip:** The server will still start without datasets — it gracefully skips models that can't be loaded and uses rule-based fallbacks for symptom analysis.

---

## 🐳 Deployment

### Docker

```bash
docker build -t foresee-inference .
docker run -p 8000:8000 --env-file .env foresee-inference
```

### Railway / Nixpacks

The project includes `nixpacks.toml` and `Procfile` for one-click Railway deployment:

1. Connect your GitHub repo on [Railway](https://railway.app)
2. Set the root directory to `apps/inference`
3. Add environment variables from `.env.example`
4. Deploy 🚀

### Heroku

Uses the included `Procfile` and `Aptfile` for system dependencies.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Web Framework** | Flask 3.0 + Gunicorn |
| **ML / Deep Learning** | TensorFlow 2.15 (CPU), scikit-learn, joblib |
| **Image Processing** | OpenCV (headless), Pillow |
| **Data Processing** | Pandas, NumPy, statsmodels |
| **Database** | PostgreSQL (Neon) via psycopg 3 |
| **Authentication** | Clerk (RS256 JWT verification) |
| **Rate Limiting** | Flask-Limiter (Redis / in-memory) |
| **PDF Generation** | xhtml2pdf (Cairo-backed) |
| **Containerization** | Docker (multi-stage), Nixpacks |

---

<div align="center">

**Part of the [Foresee](https://github.com/HumayunK01/CodeRedProject) platform** · BE Final Year Major Project

</div>
