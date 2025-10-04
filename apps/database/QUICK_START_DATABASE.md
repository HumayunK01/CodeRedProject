# 🚀 Quick Start: Neon Database Setup

## 5-Minute Setup

### Step 1: Create Neon Project (2 minutes)

1. Visit [neon.tech](https://neon.tech) and sign up/login
2. Click **"New Project"**
3. Name it: `outbreaklens`
4. Select region closest to you
5. Click **"Create"**

### Step 2: Get Connection String (1 minute)

After project creation, Neon shows your connection strings:

```
postgresql://[user]:[password]@ep-xxxxx.region.neon.tech/outbreaklens?sslmode=require
```

Copy **both**:
- ✅ Direct connection
- ✅ Pooled connection (ends with `-pooler`)

### Step 3: Configure Environment (1 minute)

Update your `.env` file:

```env
DATABASE_URL="postgresql://[user]:[password]@ep-xxxxx.region.neon.tech/outbreaklens?sslmode=require"
DATABASE_URL_POOLED="postgresql://[user]:[password]@ep-xxxxx-pooler.region.neon.tech/outbreaklens?sslmode=require"
```

### Step 4: Initialize Database (1 minute)

Run these commands from the project root:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to Neon
npm run db:push

# Verify (optional)
npm run db:studio
```

Or run from the database directory:

```bash
cd apps/database
npm run generate
npm run push
npm run studio
```

## ✅ You're Done!

Your database is ready to use. Start coding:

```typescript
import { db } from '@/lib/db';

// Create a diagnosis
const diagnosis = await db.diagnosis.create({
  data: {
    userId: user.id,
    imageUrl: imageUrl,
    result: 'positive',
    confidence: 95.5,
    modelVersion: 'v1.0.0',
    processingTime: 2.3,
  },
});
```

## Available Commands

```bash
npm run db:generate          # Generate Prisma Client
npm run db:push              # Push schema to database
npm run db:migrate           # Create migration
npm run db:studio            # Open visual editor
```

## Need Help?

- **Full Setup Guide**: `DATABASE_SETUP.md`
- **Code Examples**: `prisma/README.md`
- **Summary**: `NEON_DATABASE_SUMMARY.md`

## Troubleshooting

**Connection Error?**
- Verify `.env` has correct connection string
- Ensure it includes `?sslmode=require`

**Type Errors?**
```bash
npm run db:generate
```

**Need to Start Fresh?**
```bash
npx prisma migrate reset  # ⚠️ Deletes all data
```

---

**Time to setup**: ~5 minutes  
**Difficulty**: Easy 🟢

