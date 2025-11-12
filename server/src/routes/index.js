import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import spaceRoutes from './space.routes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);       // /api/auth/*
router.use('/users', userRoutes);      // /api/users/*
router.use('/spaces', spaceRoutes);    // /api/spaces/*

export default router;

