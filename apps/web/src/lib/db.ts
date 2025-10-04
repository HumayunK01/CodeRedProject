import { PrismaClient } from "../../../../database/generated";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
export const db = global.prisma || new PrismaClient({
  log: import.meta.env.DEV ? ['query', 'error', 'warn'] : ['error'],
});

if (import.meta.env.DEV) {
  global.prisma = db;
}

export default db;

