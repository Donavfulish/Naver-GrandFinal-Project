import express from 'express';
import cors from 'cors';
import { requestLogger, notFoundLogger } from './middleware/logger.js';
import errorHandlerMiddleware from './middleware/errorHandler.js';

// Routes
import apiRoutes from './routes/index.js';

const app = express();

// ===== Middleware cơ bản =====
app.use(cors({ origin: true })); // cho phép tất cả origin (nên giới hạn trong production)
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Logging middleware =====
app.use(requestLogger);

// ===== API Routes =====
app.use('/api', apiRoutes);

// ===== 404 handler =====
app.use(notFoundLogger);

// ===== Error handler =====
app.use(errorHandlerMiddleware);

export default app;
