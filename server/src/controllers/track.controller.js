import prisma from '../config/prisma.js';
import logger from '../config/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all tracks with preview information
 * GET /tracks
 */
export const getAllTracks = async (req, res) => {
  try {
    const { emotion, tags, source, limit = 50, offset = 0 } = req.query;

    // Build filter conditions
    const whereConditions = {
      is_deleted: false,
    };

    // Filter by emotion
    if (emotion) {
      whereConditions.emotion = {
        has: emotion,
      };
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      whereConditions.tags = {
        hasSome: tagArray,
      };
    }

    // Filter by source (SYSTEM or USER)
    if (source) {
      whereConditions.source = source.toUpperCase();
    }

    // Query tracks from database
    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          thumbnail: true,
          track_url: true,
          emotion: true,
          tags: true,
          source: true,
          created_at: true,
          updated_at: true,
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.track.count({
        where: whereConditions,
      }),
    ]);

    // Transform tracks to include preview/stream URL
    const tracksWithPreview = tracks.map(track => ({
      id: track.id,
      name: track.name,
      thumbnail: track.thumbnail,
      emotion: track.emotion,
      tags: track.tags,
      source: track.source,
      preview_url: `/tracks/${track.id}/stream`,
      is_external: track.track_url.startsWith('http://') || track.track_url.startsWith('https://'),
      created_at: track.created_at,
      updated_at: track.updated_at,
    }));

    logger.info(`Retrieved ${tracks.length} tracks (total: ${total})`);

    res.status(200).json({
      success: true,
      data: {
        tracks: tracksWithPreview,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + tracks.length < total,
        },
      },
    });

  } catch (error) {
    logger.error(`Error in getAllTracks: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tracks',
      error: error.message,
    });
  }
};

/**
 * Stream a track by ID
 * GET /tracks/:id/stream
 */
export const streamTrack = async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy track từ DB
    const track = await prisma.track.findFirst({
      where: { id, is_deleted: false }
    });

    if (!track) {
      logger.warn(`Track not found or deleted: ${id}`);
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    const trackUrl = track.track_url;

    // Nếu là URL external
    if (trackUrl.startsWith('http://') || trackUrl.startsWith('https://')) {
      return res.json({
        success: true,
        data: { track_id: track.id, url: trackUrl, topic: track.topic, type: 'external' }
      });
    }

    // Local file: resolve từ root project
    const filePath = path.join(process.cwd(), 'storage', 'track', path.basename(trackUrl));

    if (!fs.existsSync(filePath)) {
      logger.error(`Track file not found: ${filePath} for track ${id}`);
      return res.status(404).json({ success: false, message: 'Track file not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const fileExt = path.extname(filePath).toLowerCase();

    let contentType = 'audio/mpeg'; // default
    if (fileExt === '.mp4' || fileExt === '.m4a') contentType = 'audio/mp4';
    else if (fileExt === '.wav') contentType = 'audio/wav';
    else if (fileExt === '.ogg') contentType = 'audio/ogg';

    const range = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      });
      fileStream.pipe(res);

      fileStream.on('error', err => {
        logger.error(`Error streaming track ${id}: ${err.message}`);
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Error streaming track' });
      });

    } else {
      // Stream toàn bộ file
      const fileStream = fs.createReadStream(filePath);
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      });
      fileStream.pipe(res);

      fileStream.on('error', err => {
        logger.error(`Error streaming track ${id}: ${err.message}`);
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Error streaming track' });
      });
    }

  } catch (err) {
    logger.error(`Error in streamTrack for track ${id}: ${err.message}`, { stack: err.stack });
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};


/**
 * Search tracks by name
 * GET /tracks/search
 */
export const searchTracks = async (req, res) => {
  try {
    const { name, limit = 50, offset = 0 } = req.query;

    // Validate name parameter
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search name is required',
      });
    }

    // Build filter conditions with case-insensitive search
    const whereConditions = {
      is_deleted: false,
      name: {
        contains: name.trim(),
        mode: 'insensitive',
      },
    };

    // Query tracks from database
    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          thumbnail: true,
          track_url: true,
          emotion: true,
          tags: true,
          source: true,
          created_at: true,
          updated_at: true,
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.track.count({
        where: whereConditions,
      }),
    ]);

    // Transform tracks to include preview/stream URL
    const tracksWithPreview = tracks.map(track => ({
      id: track.id,
      name: track.name,
      thumbnail: track.thumbnail,
      emotion: track.emotion,
      tags: track.tags,
      source: track.source,
      preview_url: `/tracks/${track.id}/stream`,
      is_external: track.track_url.startsWith('http://') || track.track_url.startsWith('https://'),
      created_at: track.created_at,
      updated_at: track.updated_at,
    }));

    logger.info(`Search for "${name}" found ${tracks.length} tracks (total: ${total})`);

    res.status(200).json({
      success: true,
      data: tracksWithPreview,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + tracks.length < total,
      },
    });

  } catch (error) {
    logger.error(`Error in searchTracks: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to search tracks',
      error: error.message,
    });
  }
};
