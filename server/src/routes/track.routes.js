import express from 'express';
import { streamTrack } from '../controllers/track.controller.js';

const router = express.Router();

/**
 * GET /tracks/:id/stream
 * Stream a track by ID with Range header support
 */
router.get('/:id/stream', streamTrack);

export default router;

