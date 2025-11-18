import 'dotenv/config';
import { PORT, NODE_ENV } from './src/config/env.js';
import prisma from './src/config/prisma.js';
import logger from './src/config/logger.js';
import app from './src/app.js';
import https from 'https';
import fs from 'fs';

const startDevServer = async () => {
  try {
    const port = Number(PORT) || 5000;
    const useHttps = process.env.LOCAL_USE_HTTPS === 'true';
    let server;
    const protocol = useHttps ? 'https' : 'http';
    const domain = 'localhost';

    if (useHttps) {
      const options = {
        key: fs.readFileSync('./cert/key.pem'),
        cert: fs.readFileSync('./cert/cert.pem'),
      };
      server = https.createServer(options, app).listen(port, () => {
        logger.info('='.repeat(50));
        logger.info(`Dev HTTPS Server started successfully`);
        logger.info(`Environment: ${NODE_ENV}`);
        logger.info(`Access URL: ${protocol}://${domain}:${port}`);
        logger.info('='.repeat(50));
      });
    } else {
      server = app.listen(port, () => {
        logger.info('='.repeat(50));
        logger.info(`Dev HTTP Server started successfully`);
        logger.info(`Environment: ${NODE_ENV}`);
        logger.info(`Access URL: ${protocol}://${domain}:${port}`);
        logger.info('='.repeat(50));
      });
    }

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.warn(`⚠️  Received ${signal}. Shutting down...`);
      server.close(async (err) => {
        if (err) logger.error('Error closing server:', err);
        try {
          await prisma.$disconnect();
          logger.info('Prisma disconnected');
        } catch (e) {
          logger.warn('Error disconnecting Prisma:', e);
        }
        process.exit(0);
      });
      setTimeout(() => {
        logger.warn('Forced shutdown (timeout)');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (err) => shutdown('uncaughtException'));
    process.on('unhandledRejection', (reason) => shutdown('unhandledRejection'));

    return server;
  } catch (err) {
    logger.error('❌ Failed to start dev server:', err);
    process.exit(1);
  }
};

// Chỉ chạy nếu gọi trực tiếp
startDevServer();
