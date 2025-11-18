import express from 'express';
import { getAllTracks, streamTrack } from '../controllers/track.controller.js';

const router = express.Router();

/**
 * GET /tracks
 * Get all tracks with preview information
 * Query params:
 * - emotion: filter by emotion (string)
 * - tags: filter by tags (string or array)
 * - source: filter by source (SYSTEM or USER)
 * - limit: number of results (default: 50)
 * - offset: pagination offset (default: 0)
 */
router.get('/', getAllTracks);

/**
 * GET /tracks/:id/stream
 * Stream a track by ID with Range header support
 */
router.get('/:id/stream', streamTrack);

export default router;
