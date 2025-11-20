import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Space Background Upload Tests', () => {
  let testUser;
  let testTag;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        name: 'Test User Background',
        email: `test-bg-${Date.now()}@example.com`,
        password_hash: 'hashedpassword',
      }
    });

    // Create test tag
    testTag = await prisma.tag.create({
      data: {
        name: `Test Tag BG ${Date.now()}`,
      }
    });

    // Ensure storage directory exists
    const storagePath = path.join(__dirname, '../../storage/background');
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.space.deleteMany({
      where: { user_id: testUser.id }
    });

    await prisma.background.deleteMany({
      where: {
        background_url: { contains: '/storage/background/' }
      }
    });

    await prisma.tag.delete({
      where: { id: testTag.id }
    });

    await prisma.user.delete({
      where: { id: testUser.id }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/spaces - Create Space with Background Upload', () => {
    it('should create space with base64 background image', async () => {
      // Create a small test image in base64 (1x1 PNG)
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await request(app)
        .post('/api/spaces')
        .send({
          user_id: testUser.id,
          name: 'Space with Base64 Background',
          description: 'Test space with uploaded background',
          tags: [testTag.id],
          backgroundBase64: base64Image,
          backgroundFileFormat: 'png',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.background_id).toBeDefined();

      // Verify background was created
      const background = await prisma.background.findUnique({
        where: { id: response.body.data.background_id }
      });

      expect(background).toBeDefined();
      expect(background.background_url).toContain('/storage/background/');
      expect(background.background_url).toContain('.png');

      // Verify file exists
      const filename = background.background_url.split('/').pop();
      const filePath = path.join(__dirname, '../../storage/background', filename);
      expect(fs.existsSync(filePath)).toBe(true);

      // Clean up file
      fs.unlinkSync(filePath);
    });

    it('should create space with binary background data', async () => {
      // Create a small test buffer
      const binaryData = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header

      const response = await request(app)
        .post('/api/spaces')
        .send({
          user_id: testUser.id,
          name: 'Space with Binary Background',
          description: 'Test space with binary background',
          tags: [testTag.id],
          backgroundFileData: Array.from(binaryData),
          backgroundFileFormat: 'jpg',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.background_id).toBeDefined();

      // Verify background was created
      const background = await prisma.background.findUnique({
        where: { id: response.body.data.background_id }
      });

      expect(background).toBeDefined();
      expect(background.background_url).toContain('/storage/background/');
      expect(background.background_url).toContain('.jpg');

      // Clean up file
      const filename = background.background_url.split('/').pop();
      const filePath = path.join(__dirname, '../../storage/background', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    it('should reject invalid image format', async () => {
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await request(app)
        .post('/api/spaces')
        .send({
          user_id: testUser.id,
          name: 'Space with Invalid Format',
          tags: [testTag.id],
          backgroundBase64: base64Image,
          backgroundFileFormat: 'exe', // Invalid format
        })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/spaces/:id - Update Space Background', () => {
    let testSpace;

    beforeEach(async () => {
      // Create a test space
      const defaultBg = await prisma.background.findFirst();
      testSpace = await prisma.space.create({
        data: {
          user_id: testUser.id,
          name: 'Test Space for Update',
          background_id: defaultBg?.id,
        }
      });

      await prisma.spaceTag.create({
        data: {
          space_id: testSpace.id,
          tag_id: testTag.id,
        }
      });
    });

    afterEach(async () => {
      await prisma.spaceTag.deleteMany({
        where: { space_id: testSpace.id }
      });
      await prisma.space.delete({
        where: { id: testSpace.id }
      });
    });

    it('should update space with new base64 background', async () => {
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await request(app)
        .patch(`/api/spaces/${testSpace.id}`)
        .send({
          appearance: {},
          backgroundBase64: base64Image,
          backgroundFileFormat: 'png',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.background_id).toBeDefined();
      expect(response.body.data.background_id).not.toBe(testSpace.background_id);

      // Verify new background was created
      const newBackground = await prisma.background.findUnique({
        where: { id: response.body.data.background_id }
      });

      expect(newBackground).toBeDefined();
      expect(newBackground.background_url).toContain('/storage/background/');

      // Clean up file
      const filename = newBackground.background_url.split('/').pop();
      const filePath = path.join(__dirname, '../../storage/background', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    it('should update space with binary background data', async () => {
      const binaryData = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);

      const response = await request(app)
        .patch(`/api/spaces/${testSpace.id}`)
        .send({
          appearance: {},
          backgroundFileData: Array.from(binaryData),
          backgroundFileFormat: 'jpg',
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Clean up file
      const newBackground = await prisma.background.findUnique({
        where: { id: response.body.data.background_id }
      });

      const filename = newBackground.background_url.split('/').pop();
      const filePath = path.join(__dirname, '../../storage/background', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('GET /storage/background/:filename - Serve Background Files', () => {
    it('should serve existing background file', async () => {
      // Create a test file
      const testFilename = `test-${Date.now()}.png`;
      const testFilePath = path.join(__dirname, '../../storage/background', testFilename);
      const testData = Buffer.from('test image data');
      fs.writeFileSync(testFilePath, testData);

      const response = await request(app)
        .get(`/storage/background/${testFilename}`)
        .expect(200);

      // Clean up
      fs.unlinkSync(testFilePath);
    });

    it('should return 404 for non-existent file', async () => {
      await request(app)
        .get('/storage/background/nonexistent.png')
        .expect(404);
    });

    it('should reject directory traversal attempts', async () => {
      await request(app)
        .get('/storage/background/../../../etc/passwd')
        .expect(400);
    });
  });
});

