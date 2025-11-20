import request from 'supertest';
import app from '../../src/app.js';
import { testHelper } from '../helpers/testHelper.js';
import { fixtures } from '../helpers/fixtures.js';
import { ErrorCodes } from '../../src/constants/errorCodes.js';

describe('POST /api/space - Create Space', () => {
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterAll(async () => {
    await testHelper.cleanDatabase();
    await testHelper.disconnect();
  });

  describe('Success Cases', () => {
    it('should create a space with minimal valid payload', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();

      const payload = fixtures.minimalCreateSpacePayload(user.id, [tag.id]);

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(payload.name);
      expect(response.body.data.user_id).toBe(user.id);
      expect(response.body.data.space_tags).toHaveLength(1);
      expect(response.body.data.space_tags[0].tag.id).toBe(tag.id);
      expect(response.body.data).toHaveProperty('background_id');
      expect(response.body.data).toHaveProperty('clock_font_id');
      expect(response.body.data).toHaveProperty('text_font_name');
    });

    it('should create a space with description', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();

      const payload = fixtures.validCreateSpacePayload(user.id, [tag.id]);

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(payload.name);
      expect(response.body.data.description).toBe(payload.description);
    });

    it('should create a space with multiple tags', async () => {
      const user = await testHelper.createUser();
      const tag1 = await testHelper.createTag({ name: 'productivity' });
      const tag2 = await testHelper.createTag({ name: 'music' });
      const tag3 = await testHelper.createTag({ name: 'relax' });

      const payload = fixtures.validCreateSpacePayload(user.id, [tag1.id, tag2.id, tag3.id]);

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.space_tags).toHaveLength(3);
      const tagIds = response.body.data.space_tags.map(st => st.tag.id);
      expect(tagIds).toContain(tag1.id);
      expect(tagIds).toContain(tag2.id);
      expect(tagIds).toContain(tag3.id);
    });

    it('should create a space with custom background', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();
      const background = await testHelper.createBackground({ background_url: 'https://example.com/bg.jpg' });

      const payload = {
        ...fixtures.minimalCreateSpacePayload(user.id, [tag.id]),
        background_id: background.id,
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.background_id).toBe(background.id);
    });

    it('should create a space with custom fonts', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();
      const clockFont = await testHelper.createClockFont({ font_name: 'Roboto' });
      const textFont = await testHelper.createTextFont({ font_name: 'Arial' });

      const payload = {
        ...fixtures.minimalCreateSpacePayload(user.id, [tag.id]),
        clock_font_id: clockFont.id,
        text_font_name: textFont.id,
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clock_font_id).toBe(clockFont.id);
      expect(response.body.data.text_font_name).toBe(textFont.id);
    });

    it('should create a space with playlists', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();
      const playlist1 = await testHelper.createPlaylist({ name: 'Playlist 1' });
      const playlist2 = await testHelper.createPlaylist({ name: 'Playlist 2' });

      const payload = {
        ...fixtures.minimalCreateSpacePayload(user.id, [tag.id]),
        playlist_ids: [playlist1.id, playlist2.id],
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.playlists).toHaveLength(2);
      const playlistIds = response.body.data.playlists.map(p => p.id);
      expect(playlistIds).toContain(playlist1.id);
      expect(playlistIds).toContain(playlist2.id);
    });

    it('should create a space with widget positions', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();

      const payload = {
        ...fixtures.minimalCreateSpacePayload(user.id, [tag.id]),
        widget_positions: fixtures.widgetPositions,
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.widget_positions).toHaveLength(2);
      expect(response.body.data.widget_positions[0]).toHaveProperty('widget_id');
      expect(response.body.data.widget_positions[0]).toHaveProperty('position');
    });

    it('should assign default background if not provided', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();
      await testHelper.createBackground({ background_url: 'https://default.com/bg.jpg' });

      const payload = fixtures.minimalCreateSpacePayload(user.id, [tag.id]);

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.background_id).toBeDefined();
    });

    it('should assign default fonts if not provided', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();
      await testHelper.createClockFont({ font_name: 'Default Clock' });
      await testHelper.createTextFont({ font_name: 'Default Text' });

      const payload = fixtures.minimalCreateSpacePayload(user.id, [tag.id]);

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clock_font_id).toBeDefined();
      expect(response.body.data.text_font_name).toBeDefined();
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when user_id is missing', async () => {
      const tag = await testHelper.createTag();

      const payload = {
        name: 'Test Space',
        tags: [tag.id],
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_2001');
    });

    it('should return 400 when name is missing', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();

      const payload = {
        user_id: user.id,
        tags: [tag.id],
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_2001');
    });

    it('should return 400 when tags are missing', async () => {
      const user = await testHelper.createUser();

      const payload = {
        user_id: user.id,
        name: 'Test Space',
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_2001');
    });

    it('should return 400 when tags array is empty', async () => {
      const user = await testHelper.createUser();

      const payload = fixtures.invalidPayloadEmptyTags(user.id);

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_2001');
    });

    it('should return 400 when name exceeds 200 characters', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();

      const payload = {
        user_id: user.id,
        name: 'a'.repeat(201),
        tags: [tag.id],
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when user_id is invalid UUID', async () => {
      const tag = await testHelper.createTag();

      const payload = {
        user_id: 'invalid-uuid',
        name: 'Test Space',
        tags: [tag.id],
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Asset Validation Error Cases', () => {
    it('should return 422 when tag ID is invalid', async () => {
      const user = await testHelper.createUser();
      const fakeTagId = '00000000-0000-0000-0000-000000000000';

      const payload = fixtures.validCreateSpacePayload(user.id, [fakeTagId]);

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_VALIDATION_FAILED);
      expect(response.body.error.message).toContain('Invalid or deleted tag');
    });

    it('should return 422 when background ID is invalid', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();
      const fakeBackgroundId = '00000000-0000-0000-0000-000000000000';

      const payload = {
        user_id: user.id,
        name: 'Test Space',
        tags: [tag.id],
        background_id: fakeBackgroundId,
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_VALIDATION_FAILED);
      expect(response.body.error.message).toContain('Invalid background');
    });

    it('should return 422 when clock font ID is invalid', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();
      const fakeClockFontId = '00000000-0000-0000-0000-000000000000';

      const payload = {
        user_id: user.id,
        name: 'Test Space',
        tags: [tag.id],
        clock_font_id: fakeClockFontId,
      };

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_VALIDATION_FAILED);
      expect(response.body.error.message).toContain('Invalid clock font');
    });

    it('should return 422 when playlist ID is invalid', async () => {
      const user = await testHelper.createUser();
      const tag = await testHelper.createTag();
      const background = await testHelper.createBackground();
      const clockFont = await testHelper.createClockFont();
      const textFont = await testHelper.createTextFont();
      const fakePlaylistId = '00000000-0000-0000-0000-000000000000';

      const payload = fixtures.completeCreateSpacePayload(
        user.id,
        [tag.id],
        background.id,
        clockFont.id,
        textFont.id,
        [fakePlaylistId]
      );

      const response = await request(app)
        .post('/api/space')
        .send(payload)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_VALIDATION_FAILED);
      expect(response.body.error.message).toContain('Invalid playlist');
    });
  });
});
