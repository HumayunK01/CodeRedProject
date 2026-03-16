<div align="center">

# 🔬 FORESEE

## AI-Powered Malaria Diagnosis & Outbreak Forecasting Platform

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

---

> 🏥 **BE Final Year Major Project** | *"Diagnose Today. Predict Tomorrow."*

[🚀 Quick Start](#-quick-start) • [📱 Screenshots](#-screenshots) • [🧠 ML Models](#-machine-learning-models) • [🏗️ Architecture](#-architecture) • [🔧 Tech Stack](#-tech-stack)

---

</div>

## 🎯 Why Foresee?

**Foresee** is a comprehensive AI/ML platform designed to revolutionize malaria diagnostics and outbreak prediction in endemic regions. By combining deep learning microscopy analysis with epidemiological risk modeling, we aim to bridge the gap where skilled healthcare professionals are scarce.

### ✨ Key Capabilities

| 🔬 Diagnosis | 📈 Forecasting | 🛡️ Safety | 📊 Analytics |
|:---:|:---:|:---:|:---:|
| 94.85% CNN Accuracy | ARIMA Time-Series | OOD Image Filtering | Real-time Dashboards |
| 27,558 NIH Images | 1-4 Week Predictions | 7-Layer Security | Interactive Maps |
| DHS Risk Screening | Hotspot Detection | RBAC Access Control | PDF Reports |

---

## 📸 Platform Screenshots

<div align="center">

| Landing Page | Diagnosis Dashboard | Forecasting & Analytics |
|:---:|:---:|:---:|
| ![Landing](apps/web/public/preview.jpg) | ![Diagnosis](apps/web/public/preview1.jpg) | ![Forecast](apps/web/public/preview2%20(1).jpg) |

</div>

---

## 🧠 Machine Learning Models

### 1. 🔬 CNN Parasite Detector
```
malaria_cnn_full.h5 · TensorFlow 2.15 · 27,558 images
```
| Metric | Score |
|:---|:---:|
| **Accuracy** | 94.85% |
| **Precision** | 95.6% |
| **Recall** | 94.0% |
| **F1-Score** | 94.8% |

### 2. 🏥 DHS Risk Index Calculator
```
malaria_symptoms_dhs.pkl · Random Forest
```
Epidemiological risk screening using DHS survey methodology with features like fever history, age, residence type, and anemia levels.

### 3. 🚫 Gatekeeper Autoencoder
```
gatekeeper_autoencoder.h5 · Convolutional Autoencoder
```
Out-of-distribution detection to reject invalid/non-medical images before CNN analysis.

### 4. 📈 ARIMA Outbreak Forecaster
```
outbreak_forecaster.pkl · statsmodels
```
Seasonal time-series forecasting for regional case predictions with 95% confidence intervals.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         🌐 CLIENT LAYER                              │
│            React 18 · Vite · Tailwind CSS · Clerk Auth             │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS + JWT Bearer
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         🔮 API LAYER (Flask)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐            │
│  │   CNN +     │  │    DHS       │  │     ARIMA      │            │
│  │   Autoencoder│  │  Random Forest │  │   Forecaster   │            │
│  └─────────────┘  └──────────────┘  └────────────────┘            │
│                                                                     │
│  Auth: RS256 JWKS · Rate Limiting · RBAC · 7-Layer Security        │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ psycopg 3
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      🗄️ DATABASE LAYER                             │
│              Neon PostgreSQL · Prisma ORM                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

### Backend
| Technology | Purpose |
|:---|:---|
| Python 3.11 | Runtime |
| Flask 3.0 | Web Framework |
| TensorFlow 2.15 | Deep Learning |
| scikit-learn | ML Models |
| statsmodels | Time-Series |
| PostgreSQL | Database |

### Frontend
| Technology | Purpose |
|:---|:---|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | Components |
| Recharts | Visualizations |
| Clerk | Authentication |

### Database
| Technology | Purpose |
|:---|:---|
| Neon PostgreSQL | Serverless DB |
| Prisma | ORM & Migrations |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ | Node.js 18+ | PostgreSQL | Clerk Account

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/HumayunK01/CodeRedProject.git
cd CodeRedProject

# 2️⃣ Setup Database
cd apps/database
npm install
cp .env.example .env  # Add your Neon DATABASE_URL
npm run generate
npm run migrate

# 3️⃣ Setup Inference API
cd ../inference
python -m venv .venv
.venv\Scripts\activate  # Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add DATABASE_URL, CLERK keys
python flask_app.py  # Runs on http://localhost:8000

# 4️⃣ Setup Web Frontend
cd ../web
npm install
cp .env.example .env.local  # Add VITE_INFER_BASE_URL, Clerk keys
npm run dev  # Runs on http://localhost:8080
```

### Docker Deployment

```bash
# Copy environment template
cp .env.docker.example .env.docker

# Build and start all services
docker compose --env-file .env.docker up --build -d
```

| Service | URL |
|:---|:---|
| 🌐 Web | http://localhost:8080 |
| 🔮 API | http://localhost:8000 |

---

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Image Diagnosis (Doctor/Admin)
```http
POST /predict/image
Content-Type: multipart/form-data
```

### Symptom Risk Screening
```http
POST /predict/symptoms
Content-Type: application/json

{
  "fever": 1,
  "age_months": 36,
  "sex": "Male",
  "state": "Maharashtra",
  "residence_type": "Rural"
}
```

### Outbreak Forecast
```http
POST /forecast/region
Content-Type: application/json

{
  "region": "Maharashtra",
  "horizon_weeks": 4
}
```

---

## 🔐 Security Features

| Layer | Protection |
|:---|:---|
| 1 | CORS Strict Allowlist |
| 2 | Rate Limiting (Redis/In-Memory) |
| 3 | RS256 JWT + JWKS Verification |
| 4 | 7-Step File Upload Validation |
| 5 | Schema-Driven Input Validation |
| 6 | Security Headers |
| 7 | Audit Logging |

### Role-Based Access
- **Patient** - Risk screening, view own records
- **Doctor** - + Image diagnosis access
- **Admin** - + User management, global stats

---

## 📁 Project Structure

```
FORESEE/
├── apps/
│   ├── web/                    # React Frontend
│   │   ├── src/
│   │   │   ├── components/    # UI Components
│   │   │   ├── pages/         # Route Pages
│   │   │   ├── hooks/         # Custom Hooks
│   │   │   └── lib/           # Utilities
│   │   └── package.json
│   │
│   ├── inference/             # Flask ML Backend
│   │   ├── flask_app.py       # Main Application
│   │   ├── routes/            # API Endpoints
│   │   ├── core/              # ML & Config
│   │   ├── models/            # Trained Models
│   │   ├── scripts/           # Training Scripts
│   │   └── data/              # Datasets
│   │
│   └── database/              # Prisma ORM
│       ├── prisma/
│       │   ├── schema.prisma  # DB Schema
│       │   └── migrations/
│       └── src/
│           └── services/      # CRUD Services
│
├── package.json               # Monorepo Config
└── README.md                  # This File
```

---

## ⚠️ Important Disclaimer

> 📋 **Foresee is NOT a certified medical device.** This platform is for research and educational purposes only. All outputs should be interpreted by qualified healthcare professionals. The developers assume no liability for clinical decisions made using this tool.

---

## 👥 Team

<div align="center">

| Khan Humayun Majid | Ansari Zoha | Ansari Adnan |
|:---:|:---:|:---:|
| ![Humayun](https://github.com/HumayunK01.png) | ![Zoha](https://github.com/ZohaAnsari04.png) | ![Adnan](https://github.com/addy1805.png) |
| **ML Engineering & Backend** | **Frontend & UI/UX** | **Data Science** |
| Model architecture • API • Security | React • Design System | Dataset • Validation |

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/HumayunK01/CodeRedProject)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/devhumayun)

</div>

---

## 🙏 Acknowledgments

- [NIH Malaria Cell Images Dataset](https://lhncbc.nlm.nih.gov/LHC-downloads/downloads.html) - 27,558 annotated blood smear images
- [WHO Global Malaria Programme](https://www.who.int/teams/global-malaria-programme) - Epidemiological guidelines
- [Demographic and Health Surveys (DHS)](https://dhsprogram.com/) - Feature engineering reference

---

<div align="center">

## 🏆 Built with ❤️ for Global Health Equity

**BE Final Year Major Project** · *2026*

[![GitHub stars](https://img.shields.io/github/stars/HumayunK01/CodeRedProject?style=social)](https://github.com/HumayunK01/CodeRedProject)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>
