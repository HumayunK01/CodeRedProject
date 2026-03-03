<div align="center">

# 📦 Foresee — Apps

**Monorepo packages powering the Foresee platform.**

</div>

---

This directory contains the three core packages of the Foresee platform:

| Package | Path | Description | Tech |
|---|---|---|---|
| 🌐 **[web](./web/)** | `apps/web/` | React frontend — dashboard, diagnosis, forecasting, reports | React, Vite, TypeScript, Tailwind, shadcn/ui |
| 🔬 **[inference](./inference/)** | `apps/inference/` | Flask ML backend — malaria CNN, symptom analysis, outbreak forecasting | Python, Flask, TensorFlow, scikit-learn |
| 🗄️ **[database](./database/)** | `apps/database/` | Prisma data layer — schema, migrations, typed service classes | TypeScript, Prisma, PostgreSQL (Neon) |

---

## How they connect

```
                ┌──────────────┐
                │   Browser    │
                └──────┬───────┘
                       │
                       ▼
              ┌─────────────────┐
              │    web (React)  │  :8080
              │  Clerk auth UI  │
              └────────┬────────┘
                       │ HTTP + JWT
                       ▼
              ┌─────────────────┐
              │ inference(Flask)│  :8000
              │  ML predictions │
              │  Auth + DB CRUD │
              └────────┬────────┘
                       │ psycopg
                       ▼
              ┌─────────────────┐
              │ database (Neon) │
              │   PostgreSQL    │
              └─────────────────┘
```

- **web** → sends API requests with Clerk JWT tokens to **inference**
- **inference** → authenticates requests, runs ML models, reads/writes to **database** via direct PostgreSQL
- **database** → defines the Prisma schema & migrations, provides typed service classes (used for schema management, not at runtime by inference)

---

## Quick start

```bash
# 1. Database — generate client & run migrations
cd apps/database
npm install
cp .env.example .env        # add your Neon DATABASE_URL
npm run generate
npm run migrate

# 2. Inference — start the ML backend
cd apps/inference
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env        # add DATABASE_URL, Clerk keys, etc.
python flask_app.py

# 3. Web — start the frontend
cd apps/web
npm install
cp .env.example .env.local  # add Clerk keys, VITE_INFER_BASE_URL
npm run dev
```

See each package's README for detailed setup instructions.

---

<div align="center">

**[Foresee](https://github.com/HumayunK01/CodeRedProject)** · BE Final Year Major Project

</div>
