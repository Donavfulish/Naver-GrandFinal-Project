import 'dotenv/config';
import { PORT, NODE_ENV } from './src/config/env.js';
import prisma from './src/config/prisma.js';
import logger from './src/config/logger.js';
import app from './src/app.js';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';

const start = async () => {
  try {
    const port = Number(PORT) || 5000;
    let server;

    if (NODE_ENV === 'production') {
      // ===== PRODUCTION: HTTPS (hosting có certificate hoặc tự cung cấp cert) =====
      const options = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH || './cert/key.pem'),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH || './cert/cert.pem')
      };

      server = https.createServer(options, app).listen(port, '0.0.0.0', () => {
        logger.info('='.repeat(50));
        logger.info(`✅ HTTPS Server (production) started successfully`);
        logger.info(`Environment: ${NODE_ENV}`);
        logger.info(`Port: ${port}`);
        logger.info('='.repeat(50));
      });
    } else {
      // ===== DEV: HTTP hoặc HTTPS self-signed =====
      if (process.env.LOCAL_USE_HTTPS === 'true') {
        const options = {
          key: fs.readFileSync('./cert/key.pem'),
          cert: fs.readFileSync('./cert/cert.pem')
        };
        server = https.createServer(options, app).listen(port, '0.0.0.0', () => {
          logger.info('='.repeat(50));
          logger.info(`✅ HTTPS Server (dev) started successfully`);
          logger.info(`Environment: ${NODE_ENV}`);
          logger.info(`Port: ${port}`);
          logger.info('='.repeat(50));
        });
      } else {
        server = app.listen(port, '0.0.0.0', () => {
          logger.info('='.repeat(50));
          logger.info(`✅ HTTP Server (dev) started successfully`);
          logger.info(`Environment: ${NODE_ENV}`);
          logger.info(`Port: ${port}`);
          logger.info('='.repeat(50));
        });
      }
    }

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
