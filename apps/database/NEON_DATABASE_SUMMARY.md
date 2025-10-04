# Neon PostgreSQL Database - Setup Summary

✅ **Database setup completed successfully!**

## What Was Installed

### 1. Dependencies
- ✅ **Prisma ORM** (v6.16.3) - Type-safe database client
- ✅ **@prisma/client** (v6.16.3) - Prisma runtime

### 2. Configuration Files

#### `prisma/schema.prisma`
Comprehensive database schema with 5 models:
- **User** - User accounts synced with Clerk authentication
- **Diagnosis** - Malaria diagnosis records with AI analysis results
- **Forecast** - Outbreak forecast predictions with risk assessments
- **Report** - Generated reports and summaries
- **SystemLog** - System monitoring and error logging

#### `.env`
Environment variables file with placeholders for:
- `DATABASE_URL` - Direct Neon connection string
- `DATABASE_URL_POOLED` - Pooled connection (recommended for serverless)
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication key

#### `.env.example`
Template file for team members to copy and configure

### 3. Database Utilities

#### `apps/web/src/lib/db.ts`
Prisma client singleton with:
- Automatic connection management
- Development query logging
- Production-optimized configuration

#### `apps/web/src/lib/types.ts`
Updated to export Prisma types for TypeScript autocomplete

### 4. NPM Scripts Added

Available commands in `package.json`:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create and apply migrations (production-ready)
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database with initial data
npm run db:seed
```

### 5. Documentation

- ✅ `DATABASE_SETUP.md` - Complete setup guide with step-by-step instructions
- ✅ `prisma/README.md` - Quick reference for common database operations
- ✅ `NEON_DATABASE_SUMMARY.md` - This file

## Next Steps

### 1. Create a Neon Account and Project

1. Go to [Neon.tech](https://neon.tech) and sign up
2. Create a new project named "outbreaklens" (or your preferred name)
3. Choose a region close to your users
4. Copy both connection strings:
   - Direct connection
   - Pooled connection (recommended)

### 2. Configure Environment Variables

Update your `.env` file with the Neon connection strings:

```env
DATABASE_URL="postgresql://[user]:[password]@ep-xxxxx.region.neon.tech/outbreaklens?sslmode=require"
DATABASE_URL_POOLED="postgresql://[user]:[password]@ep-xxxxx-pooler.region.neon.tech/outbreaklens?sslmode=require"
```

**Important**: Make sure `.env` is in `.gitignore` (already configured ✅)

### 3. Initialize Your Database

Run these commands in order:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push schema to your Neon database
npm run db:push

# 3. (Optional) Open Prisma Studio to verify
npm run db:studio
```

### 4. Use in Your Application

Import the database client in your code:

```typescript
import { db } from '@/lib/db';

// Example: Create a diagnosis record
const diagnosis = await db.diagnosis.create({
  data: {
    userId: user.id,
    imageUrl: imageUrl,
    result: 'positive',
    confidence: 95.5,
    parasiteCount: 12,
    species: 'P. falciparum',
    modelVersion: 'v1.0.0',
    processingTime: 2.3,
  },
});

// Example: Query user data
const userWithData = await db.user.findUnique({
  where: { clerkId: clerkUserId },
  include: {
    diagnoses: { take: 10, orderBy: { createdAt: 'desc' } },
    forecasts: { take: 5, orderBy: { createdAt: 'desc' } },
  },
});
```

## Database Schema Overview

### User Model
Stores user information synced with Clerk:
- Clerk ID (unique identifier)
- Email, name, profile image
- Relations to diagnoses, forecasts, reports

### Diagnosis Model
Malaria diagnosis records:
- Patient demographics (age, sex, location)
- Image URL and analysis results
- Confidence scores and parasite counts
- Symptoms data (JSON)
- Processing metadata

### Forecast Model
Outbreak predictions:
- Geographic data (location, coordinates)
- Predicted case numbers (low/high/mean)
- Risk level classification
- Environmental factors
- Model confidence

### Report Model
Generated reports:
- Title and type (diagnosis summary, forecast summary, custom)
- Content (JSON)
- Status tracking (draft, published, archived)
- Date range filters

### SystemLog Model
Monitoring and logging:
- Log level (info, warning, error, critical)
- Service identifier (web, inference, database)
- Message and metadata
- Timestamps for tracking

## Key Features

### 🔒 Type Safety
Prisma provides full TypeScript support with auto-generated types

### 🚀 Performance
- Indexed fields for fast queries
- Connection pooling for serverless
- Optimized query generation

### 🔄 Migrations
Track and version your database schema changes

### 🎨 Prisma Studio
Visual database browser at `localhost:5555`

### 📊 Analytics Ready
Built-in support for aggregations and statistics

## Best Practices Implemented

✅ **SSL Required** - All connections use secure SSL mode  
✅ **Connection Pooling** - Configured for serverless environments  
✅ **Cascade Deletes** - User deletion removes all related data  
✅ **Timestamps** - Automatic `createdAt` and `updatedAt` tracking  
✅ **Indexes** - Optimized for common query patterns  
✅ **Type Safety** - Full TypeScript integration  
✅ **Singleton Pattern** - Prevents connection exhaustion  

## Useful Resources

- **Neon Dashboard**: [console.neon.tech](https://console.neon.tech)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **Neon + Prisma Guide**: [neon.tech/docs/guides/prisma](https://neon.tech/docs/guides/prisma)

## Troubleshooting

### Can't connect to database?
- Verify your `DATABASE_URL` in `.env`
- Ensure SSL mode is included: `?sslmode=require`
- Check that your Neon project is active

### Type errors after schema changes?
```bash
npm run db:generate
```

### Need to reset everything?
```bash
npx prisma migrate reset  # WARNING: Deletes all data
```

## Support

For detailed setup instructions, see `DATABASE_SETUP.md`  
For code examples, see `prisma/README.md`  
For issues, check the project repository

---

**Status**: ✅ Ready for Neon configuration  
**Last Updated**: October 4, 2025  
**Prisma Version**: 6.16.3

