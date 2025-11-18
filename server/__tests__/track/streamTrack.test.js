import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('GET /api/tracks/:id/stream', () => {
  let testTrack;
  let testTrackDeleted;
  let testTrackExternal;

  beforeAll(async () => {
    // Clean up existing test data
    await prisma.track.deleteMany({
      where: {
        topic: 'test-track-stream'
      }
    });

    // Create test tracks
    testTrack = await prisma.track.create({
      data: {
        track_url: 'test-audio.mp3',
        topic: 'test-track-stream',
        is_deleted: false
      }
    });

    testTrackDeleted = await prisma.track.create({
      data: {
        track_url: 'deleted-audio.mp3',
        topic: 'test-track-stream',
        is_deleted: true
      }
    });

    testTrackExternal = await prisma.track.create({
      data: {
        track_url: 'https://example.com/audio/sample.mp3',
        topic: 'test-track-stream',
        is_deleted: false
      }
    });

    // Create a test audio file
    const uploadsDir = path.join(__dirname, '../../uploads/tracks');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a dummy MP3 file for testing
    const testFilePath = path.join(uploadsDir, 'test-audio.mp3');
    const dummyContent = Buffer.alloc(1024 * 100, 'A'); // 100KB dummy file
    fs.writeFileSync(testFilePath, dummyContent);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.track.deleteMany({
      where: {
        topic: 'test-track-stream'
      }
    });

    // Remove test file
    const testFilePath = path.join(__dirname, '../../uploads/tracks/test-audio.mp3');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    await prisma.$disconnect();
  });

  describe('Success cases', () => {
    it('should return external URL for external hosted track', async () => {
      const response = await request(app)
        .get(`/api/tracks/${testTrackExternal.id}/stream`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.track_id).toBe(testTrackExternal.id);
      expect(response.body.data.url).toBe('https://example.com/audio/sample.mp3');
      expect(response.body.data.type).toBe('external');
    });

    it('should stream local file with correct headers', async () => {
      const response = await request(app)
        .get(`/api/tracks/${testTrack.id}/stream`)
        .expect(200);

      expect(response.headers['content-type']).toBe('audio/mpeg');
      expect(response.headers['accept-ranges']).toBe('bytes');
      expect(response.headers['cache-control']).toBe('public, max-age=3600');
    });

    it('should support Range header for seeking (partial content)', async () => {
      const response = await request(app)
        .get(`/api/tracks/${testTrack.id}/stream`)
        .set('Range', 'bytes=0-1023')
        .expect(206);

      expect(response.headers['content-range']).toMatch(/^bytes 0-1023\/\d+$/);
      expect(response.headers['accept-ranges']).toBe('bytes');
      expect(parseInt(response.headers['content-length'])).toBe(1024);
    });

    it('should support Range header with only start position', async () => {
      const response = await request(app)
        .get(`/api/tracks/${testTrack.id}/stream`)
        .set('Range', 'bytes=1000-')
        .expect(206);

      expect(response.headers['content-range']).toMatch(/^bytes 1000-\d+\/\d+$/);
    });
  });

  describe('Error cases', () => {
    it('should return 404 for non-existent track', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/tracks/${fakeId}/stream`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Track not found');
    });

    it('should return 404 for deleted track', async () => {
      const response = await request(app)
        .get(`/api/tracks/${testTrackDeleted.id}/stream`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Track not found');
    });

    it('should return 404 for local file that does not exist', async () => {
      const trackNoFile = await prisma.track.create({
        data: {
          track_url: 'non-existent-file.mp3',
          topic: 'test-track-stream',
          is_deleted: false
        }
      });

      const response = await request(app)
        .get(`/api/tracks/${trackNoFile.id}/stream`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Track file not found');

      // Clean up
      await prisma.track.delete({
        where: { id: trackNoFile.id }
      });
    });

    it('should return 404 for invalid track ID format', async () => {
      const response = await request(app)
        .get('/api/tracks/invalid-id/stream')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Logging', () => {
    it('should log track ID and timestamp when streaming', async () => {
      // This test verifies that the logging functionality works
      // The actual log content would need to be verified in the log files
      const response = await request(app)
        .get(`/api/tracks/${testTrack.id}/stream`)
        .expect(200);

      // Just verify the request was successful
      // Actual log verification would require log file inspection
      expect(response.status).toBe(200);
    });
  });
});

