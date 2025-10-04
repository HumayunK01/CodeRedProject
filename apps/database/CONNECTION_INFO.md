# 🎯 OutbreakLens Database Connection Info

## ✅ Status: Connected and Operational

Your Neon PostgreSQL database is fully set up and ready to use!

## 📋 Quick Reference

### Project Details
- **Project Name**: OutbreakLens
- **Project ID**: `royal-moon-12962875`
- **Database**: `neondb`
- **Region**: AWS US-West-2
- **PostgreSQL**: Version 17

### Access
- **Neon Console**: https://console.neon.tech/app/projects/royal-moon-12962875
- **Prisma Studio**: `npm run db:studio` (opens at localhost:5555)

## 🔌 Connection Strings

Stored in `apps/web/.env.local` file:

**For Long-Running Servers:**
```
DATABASE_URL="postgresql://neondb_owner:***@ep-autumn-star-afhvdu5e.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

**For Serverless/Edge (Recommended):**
```
DATABASE_URL_POOLED="postgresql://neondb_owner:***@ep-autumn-star-afhvdu5e-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

## 📊 Database Schema

5 tables created and ready:

| Table | Purpose | Row Count |
|-------|---------|-----------|
| User | User accounts (Clerk synced) | 0 |
| Diagnosis | Malaria diagnosis records | 0 |
| Forecast | Outbreak predictions | 0 |
| Report | Generated reports | 0 |
| SystemLog | System monitoring | 0 |

## 🚀 Usage

### In Your Code
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

### Commands
```bash
npm run db:studio      # Visual database browser
npm run db:push        # Push schema changes
npm run db:migrate     # Create migrations
npm run db:generate    # Regenerate Prisma client
```

## 📚 Documentation

- `README.md` - Database operations reference
- `DATABASE_SETUP.md` - Complete setup guide
- `QUICK_START_DATABASE.md` - 5-minute quick start
- `../NEON_CONNECTION_SUCCESS.md` - Full connection details

## 🔒 Security

- ✅ SSL enabled on all connections
- ✅ `.env.local` in `.gitignore`
- ✅ Credentials secured
- ✅ Connection pooling enabled

---

**All Systems Operational** 🟢
*Database ready for development*

