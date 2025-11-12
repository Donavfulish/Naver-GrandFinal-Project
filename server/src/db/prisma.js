/**
 * Prisma Client Singleton Instance
 * 
 * This module provides a single instance of PrismaClient to prevent
 * connection pool exhaustion and ensure consistent database access
 * across the application.
 */

import { PrismaClient } from '@prisma/client';

// Singleton instance
let prisma;

/**
 * Get or create the Prisma Client instance
 * @returns {PrismaClient} Singleton Prisma Client instance
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
    });
  }
  return prisma;
}

// Export the singleton instance
export default getPrismaClient();

/**
 * Graceful shutdown handler
 * Call this when the application is shutting down
 */
export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Prisma Client disconnected');
  }
}
