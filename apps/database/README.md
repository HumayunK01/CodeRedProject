# OutbreakLens Database Layer

This directory contains all database-related code for OutbreakLens, including Prisma schema, migrations, and generated client.

## 📁 Directory Structure

```
apps/database/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── generated/                 # Auto-generated Prisma Client (gitignored)
├── package.json              # Database package configuration
├── DATABASE_SETUP.md         # Complete setup guide
├── QUICK_START_DATABASE.md   # 5-minute quick start
├── NEON_DATABASE_SUMMARY.md  # Setup summary
└── README.md                 # This file
```

## 🚀 Quick Start

### From Project Root

```bash
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database
npm run db:studio      # Open visual editor
```

### From This Directory

```bash
cd apps/database
npm run generate       # Generate Prisma Client
npm run push           # Push schema to database
npm run studio         # Open visual editor
```

## 📚 Documentation

- **Quick Start**: `QUICK_START_DATABASE.md` - Get started in 5 minutes
- **Full Setup**: `DATABASE_SETUP.md` - Complete setup instructions
- **Summary**: `NEON_DATABASE_SUMMARY.md` - What was installed and configured

---

# Database Operations Reference

Quick reference for common database operations in OutbreakLens.

## Quick Start

1. **Set up your environment**:
   ```bash
   # Copy .env.example and add your Neon connection string
   cp .env.example .env
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

3. **Push schema to database**:
   ```bash
   npm run db:push
   ```

## Common Operations

### Creating Records

```typescript
import { db } from '@/lib/db';

// Create a user (synced with Clerk)
const user = await db.user.create({
  data: {
    clerkId: 'clerk_user_123',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
});

// Create a diagnosis
const diagnosis = await db.diagnosis.create({
  data: {
    userId: user.id,
    imageUrl: 'https://storage.example.com/image.jpg',
    result: 'positive',
    confidence: 95.5,
    parasiteCount: 12,
    species: 'P. falciparum',
    modelVersion: 'v1.0.0',
    processingTime: 2.3,
    location: 'Lagos, Nigeria',
    latitude: 6.5244,
    longitude: 3.3792,
  },
});

// Create a forecast
const forecast = await db.forecast.create({
  data: {
    userId: user.id,
    location: 'Lagos',
    latitude: 6.5244,
    longitude: 3.3792,
    country: 'Nigeria',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    riskLevel: 'high',
    casesLow: 1000,
    casesHigh: 1500,
    casesMean: 1250,
    modelVersion: 'v1.0.0',
    confidence: 92.0,
  },
});
```

### Reading Records

```typescript
// Find a user by Clerk ID
const user = await db.user.findUnique({
  where: { clerkId: 'clerk_user_123' },
  include: {
    diagnoses: true,
    forecasts: true,
    reports: true,
  },
});

// Get all diagnoses for a user
const diagnoses = await db.diagnosis.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// Get high-risk forecasts
const highRiskForecasts = await db.forecast.findMany({
  where: {
    riskLevel: 'high',
    startDate: { gte: new Date() },
  },
  include: { user: true },
});

// Get recent positive diagnoses
const recentPositives = await db.diagnosis.findMany({
  where: {
    result: 'positive',
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    },
  },
  orderBy: { createdAt: 'desc' },
});
```

### Updating Records

```typescript
// Update a user
const updatedUser = await db.user.update({
  where: { id: user.id },
  data: {
    firstName: 'Jane',
    lastName: 'Smith',
  },
});

// Update a report status
const publishedReport = await db.report.update({
  where: { id: report.id },
  data: {
    status: 'published',
    publishedAt: new Date(),
  },
});
```

### Deleting Records

```typescript
// Delete a diagnosis
await db.diagnosis.delete({
  where: { id: diagnosis.id },
});

// Delete all old system logs (older than 30 days)
await db.systemLog.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  },
});
```

### Aggregations and Statistics

```typescript
// Count diagnoses by result type
const diagnosisCounts = await db.diagnosis.groupBy({
  by: ['result'],
  _count: true,
  where: {
    userId: user.id,
  },
});

// Get average confidence for positive diagnoses
const avgConfidence = await db.diagnosis.aggregate({
  where: { result: 'positive' },
  _avg: { confidence: true },
  _count: true,
});

// Get total cases for a location
const totalCases = await db.forecast.aggregate({
  where: {
    location: 'Lagos',
    startDate: { gte: new Date('2025-01-01') },
  },
  _sum: { casesMean: true },
});
```

### Transactions

```typescript
// Create a user and their first diagnosis in a transaction
const result = await db.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      clerkId: 'clerk_user_456',
      email: 'newuser@example.com',
    },
  });

  const diagnosis = await tx.diagnosis.create({
    data: {
      userId: user.id,
      imageUrl: 'https://storage.example.com/image2.jpg',
      result: 'negative',
      confidence: 98.0,
      modelVersion: 'v1.0.0',
      processingTime: 1.8,
    },
  });

  return { user, diagnosis };
});
```

### Raw SQL Queries

```typescript
// For complex queries not easily expressed with Prisma
const results = await db.$queryRaw`
  SELECT 
    location,
    COUNT(*) as diagnosis_count,
    AVG(confidence) as avg_confidence
  FROM "Diagnosis"
  WHERE result = 'positive'
  GROUP BY location
  ORDER BY diagnosis_count DESC
  LIMIT 10
`;
```

## Best Practices

### 1. Use Transactions for Related Operations
```typescript
// Good: Atomic operation
await db.$transaction([
  db.diagnosis.create({ data: diagnosisData }),
  db.systemLog.create({ data: logData }),
]);

// Bad: Separate operations (not atomic)
await db.diagnosis.create({ data: diagnosisData });
await db.systemLog.create({ data: logData });
```

### 2. Use Select to Optimize Queries
```typescript
// Good: Only fetch needed fields
const users = await db.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
  },
});

// Less efficient: Fetches all fields
const users = await db.user.findMany();
```

### 3. Use Indexes for Frequently Queried Fields
```prisma
// Already included in schema.prisma
@@index([userId])
@@index([createdAt])
```

### 4. Handle Errors Properly
```typescript
try {
  const user = await db.user.create({ data: userData });
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    console.error('User with this email already exists');
  } else {
    console.error('Database error:', error);
  }
}
```

### 5. Use Connection Pooling for Serverless
```env
# Use pooled connection for Vercel, Netlify, etc.
DATABASE_URL="${DATABASE_URL_POOLED}"
```

## Useful Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create migration
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:deploy

# Open Prisma Studio
npm run db:studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Environment Variables

```env
# Direct connection (for long-running servers)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Pooled connection (for serverless/edge functions)
DATABASE_URL_POOLED="postgresql://user:password@host-pooler/database?sslmode=require"
```

## Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Ensure SSL mode is enabled: `?sslmode=require`
- Verify Neon project is active

### "Type error: Cannot find module"
- Run `npm run db:generate` to regenerate the client
- Restart your TypeScript server

### "Migration failed"
- Check schema for errors: `npx prisma validate`
- Review migration history: `npx prisma migrate status`
- If stuck, reset (WARNING: deletes data): `npx prisma migrate reset`

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma + Neon Guide](https://neon.tech/docs/guides/prisma)

