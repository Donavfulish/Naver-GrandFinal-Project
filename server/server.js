import 'dotenv/config';
import { PORT, NODE_ENV } from './src/config/env.js';
import prisma from './src/config/prisma.js';
import logger from './src/config/logger.js';
import app from './src/app.js';
import { fileURLToPath } from 'url';

const start = async () => {
  try {
    // ===== Start server =====
    const port = Number(PORT) || 3000;
    const server = app.listen(port, '0.0.0.0', () => {
      logger.info('='.repeat(50));
      logger.info(`✅ Server started successfully`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`Port: ${port}`);
      logger.info('='.repeat(50));
    });

    // ===== Graceful Shutdown =====
    const shutdown = async (signal) => {
      logger.warn(`⚠️  Received ${signal}. Shutting down gracefully...`);

      server.close(async (err) => {
        if (err) {
          logger.error('Error closing server:', err);
          process.exit(1);
        }

        try {
          await prisma.$disconnect();
          logger.info('Prisma disconnected');
        } catch (e) {
          logger.warn('Error disconnecting Prisma:', e);
        }

        logger.info('✅ Shutdown complete');
        process.exit(0);
      });

      // Force exit sau 10s nếu chưa tắt xong
      setTimeout(() => {
        logger.warn('⏰ Forced shutdown (timeout)');
        process.exit(1);
      }, 10000).unref();
    };

    // ===== Signal Handlers =====
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      shutdown('unhandledRejection');
    });

    return server;
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// ===== Run immediately if called directly =====
if (import.meta.url === `file://${fileURLToPath(import.meta.url)}`) {
  start();
}

export { start };
