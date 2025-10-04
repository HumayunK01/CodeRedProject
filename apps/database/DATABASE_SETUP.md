# Database Setup Guide - Neon PostgreSQL

This guide will help you set up a PostgreSQL database using Neon for the OutbreakLens application.

## Prerequisites

- Node.js 18+ installed
- A Neon account (sign up at https://neon.tech)
- Git repository access

## Step 1: Create a Neon Database

1. Go to [Neon.tech](https://neon.tech) and sign up or log in
2. Click "Create Project" or "New Project"
3. Configure your project:
   - **Project Name**: `outbreaklens` (or your preferred name)
   - **Region**: Choose the region closest to your users
   - **PostgreSQL Version**: Latest version (recommended)
4. Click "Create Project"

## Step 2: Get Your Connection Strings

After creating your project, Neon will provide you with connection strings:

1. **Direct Connection** (DATABASE_URL):
   ```
   postgresql://[user]:[password]@ep-xxxxx.region.neon.tech/outbreaklens?sslmode=require
   ```

2. **Pooled Connection** (DATABASE_URL_POOLED - recommended for serverless):
   ```
   postgresql://[user]:[password]@ep-xxxxx-pooler.region.neon.tech/outbreaklens?sslmode=require
   ```

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Neon connection strings:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@ep-xxxxx.region.neon.tech/outbreaklens?sslmode=require"
   DATABASE_URL_POOLED="postgresql://[user]:[password]@ep-xxxxx-pooler.region.neon.tech/outbreaklens?sslmode=require"
   ```

   **Important**: Never commit the `.env` file to version control!

## Step 4: Generate Prisma Client

Generate the Prisma Client to interact with your database:

```bash
npm run db:generate
```

## Step 5: Push Schema to Database

For development, you can push the schema directly without creating migrations:

```bash
npm run db:push
```

Or, to create a migration (recommended for production):

```bash
npm run db:migrate
```

When prompted, give your migration a descriptive name like `init` or `initial_setup`.

## Step 6: Verify Database Connection

You can open Prisma Studio to visually inspect your database:

```bash
npm run db:studio
```

This will open a browser window at `http://localhost:5555` where you can view and edit your data.

## Available Database Commands

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (no migrations)
- `npm run db:migrate` - Create and apply migrations
- `npm run db:migrate:deploy` - Apply migrations in production
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database with initial data

## Project Structure

The database layer is now organized in `apps/database/`:

```
apps/database/
├── prisma/
│   └── schema.prisma      # Database schema definition
├── generated/             # Auto-generated Prisma Client (gitignored)
├── package.json           # Database package configuration
├── DATABASE_SETUP.md      # This file
├── QUICK_START_DATABASE.md
├── NEON_DATABASE_SUMMARY.md
└── README.md              # Quick reference guide
```

## Database Schema

The OutbreakLens database includes the following models:

### User
Stores user information synced with Clerk authentication.

### Diagnosis
Records of malaria diagnoses including:
- Patient information
- Image analysis results
- Confidence scores
- Parasite counts and species
- Symptoms data

### Forecast
Outbreak forecast predictions including:
- Location and geographic data
- Predicted case numbers (low, high, mean)
- Risk levels
- Environmental factors
- Model confidence

### Report
Generated reports including:
- Diagnosis summaries
- Forecast summaries
- Custom reports
- Status tracking

### SystemLog
System monitoring and logging for:
- Service health
- Error tracking
- Performance monitoring

## Best Practices

### Connection Pooling
For serverless environments (like Vercel), use the pooled connection string:
```env
DATABASE_URL="${DATABASE_URL_POOLED}"
```

### SSL Mode
Always use `sslmode=require` for Neon connections to ensure secure data transmission.

### Connection Limits
Neon's free tier has connection limits:
- **Free Tier**: 100 active connections
- **Pro Tier**: 1000+ active connections

Use connection pooling to avoid hitting these limits.

### Schema Changes

1. **Development**: Use `npm run db:push` for rapid iteration
2. **Production**: Always use migrations (`npm run db:migrate`) for trackable changes

### Backup and Recovery

Neon provides automatic backups:
- Point-in-time recovery
- Branch-based development
- Automatic daily backups

Access these features from your Neon dashboard.

## Using the Database in Your Code

The database client is located at `apps/web/src/lib/db.ts` and imports from the generated Prisma client in `apps/database/generated/`.

Import the Prisma client in your application:

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

// Example: Query forecasts
const forecasts = await db.forecast.findMany({
  where: {
    userId: user.id,
    riskLevel: 'high',
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
});
```

## Troubleshooting

### Connection Issues
- Verify your connection string is correct
- Ensure SSL mode is enabled (`sslmode=require`)
- Check that your IP is not blocked (Neon allows all IPs by default)

### Migration Errors
- Make sure your schema is valid: `npx prisma validate`
- Reset your database if needed: `npx prisma migrate reset` (WARNING: This deletes all data)

### Performance Issues
- Use connection pooling for serverless deployments
- Add appropriate indexes to your models (already included in schema)
- Monitor query performance with Prisma's query logging

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Neon + Prisma Guide](https://neon.tech/docs/guides/prisma)

## Support

For issues specific to:
- **Neon**: Contact Neon support or check their [Discord](https://discord.gg/neon)
- **Prisma**: Check [Prisma's Discord](https://pris.ly/discord)
- **OutbreakLens**: Open an issue in the project repository

