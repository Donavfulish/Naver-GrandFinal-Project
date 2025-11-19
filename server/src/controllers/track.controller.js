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
    // Query track from database with is_deleted = false
    const track = await prisma.track.findFirst({
      where: {
        id: id,
        is_deleted: false
      }
    });

    // Return 404 if track not found
    if (!track) {
      logger.warn(`Track not found or deleted: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Track not found'
      });
    }

    // Log track access
    logger.info(`Streaming track: ${id} at ${new Date().toISOString()}`);

    const trackUrl = track.track_url;

    // Check if URL is external (starts with http:// or https://)
    if (trackUrl.startsWith('http://') || trackUrl.startsWith('https://')) {
      // Return URL for external hosted files
      return res.json({
        success: true,
        data: {
          track_id: track.id,
          url: trackUrl,
          topic: track.topic,
          type: 'external'
        }
      });
    }

    // Handle local file streaming
    // Resolve file path (assuming track_url is relative to server root or absolute)
    let filePath;
    if (path.isAbsolute(trackUrl)) {
      filePath = trackUrl;
    } else {
      // Assume files are stored in server/uploads/tracks or similar
      filePath = path.join(__dirname, '../../uploads/tracks', trackUrl);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`Track file not found: ${filePath} for track ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Track file not found'
      });
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const fileExt = path.extname(filePath).toLowerCase();

    // Determine content type
    let contentType = 'audio/mpeg'; // default
    if (fileExt === '.mp4' || fileExt === '.m4a') {
      contentType = 'audio/mp4';
    } else if (fileExt === '.mp3') {
      contentType = 'audio/mpeg';
    } else if (fileExt === '.wav') {
      contentType = 'audio/wav';
    } else if (fileExt === '.ogg') {
      contentType = 'audio/ogg';
    }

    // Handle Range header for seeking support
    const range = req.headers.range;

    if (range) {
      // Parse range header (e.g., "bytes=0-1023")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      // Create read stream for the specified range
      const fileStream = fs.createReadStream(filePath, { start, end });

      // Set headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      });

      // Pipe the file stream to response
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        logger.error(`Error streaming track ${id}: ${error.message}`);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error streaming track'
          });
        }
      });

    } else {
      // No range header - stream entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        logger.error(`Error streaming track ${id}: ${error.message}`);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error streaming track'
          });
        }
      });
    }

  } catch (error) {
    logger.error(`Error in streamTrack for track ${id}: ${error.message}`, { stack: error.stack });

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
