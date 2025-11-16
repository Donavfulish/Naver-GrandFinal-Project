import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import spaceRoutes from './space.routes.js';
import searchRoutes from './search.routes.js';
import spotifyRoutes from './spotify.routes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);       // /api/auth/*
router.use('/users', userRoutes);      // /api/users/*
router.use('/spaces', spaceRoutes);     // /api/spaces/*
router.use('/search', searchRoutes);    // /api/search/*
router.use('/spotify', spotifyRoutes);  // /api/spotify/*

export default router;
