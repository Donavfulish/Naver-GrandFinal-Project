import request from 'supertest';
import app from '../../src/app.js';
import { testHelper } from '../helpers/testHelper.js';
import { fixtures } from '../helpers/fixtures.js';
import { ErrorCodes } from '../../src/constants/errorCodes.js';

describe('PATCH /api/space/:id - Update Space', () => {
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterAll(async () => {
    await testHelper.cleanDatabase();
    await testHelper.disconnect();
  });

  describe('Metadata Updates', () => {
    it('should update space name', async () => {
      const { space } = await testHelper.createSpace();

      const payload = {
        metadata: {
          name: 'Updated Space Name',
        },
      };

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Space Name');
      expect(response.body.data.description).toBe(space.description); // Unchanged
    });

    it('should update space description', async () => {
      const { space } = await testHelper.createSpace();

      const payload = {
        metadata: {
          description: 'Brand new description',
        },
      };

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Brand new description');
      expect(response.body.data.name).toBe(space.name); // Unchanged
    });

    it('should update both name and description', async () => {
      const { space } = await testHelper.createSpace();

      const payload = fixtures.validUpdateMetadata();

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(payload.metadata.name);
      expect(response.body.data.description).toBe(payload.metadata.description);
    });
  });

  describe('Appearance Updates', () => {
    it('should update background', async () => {
      const { space } = await testHelper.createSpace();
      const newBackground = await testHelper.createBackground({ background_url: 'https://example.com/new-bg.jpg' });

      const payload = {
        appearance: {
          background_id: newBackground.id,
        },
      };

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.background_id).toBe(newBackground.id);
    });

    it('should update clock font', async () => {
      const { space } = await testHelper.createSpace();
      const newClockFont = await testHelper.createClockFont({ font_name: 'New Clock Font' });

      const payload = {
        appearance: {
          clock_font_id: newClockFont.id,
        },
      };

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clock_font_id).toBe(newClockFont.id);
    });

    it('should update text font', async () => {
      const { space } = await testHelper.createSpace();
      const newTextFont = await testHelper.createTextFont({ font_name: 'New Text Font' });

      const payload = {
        appearance: {
          text_font_name: newTextFont.id,
        },
      };

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.text_font_name).toBe(newTextFont.id);
    });

    it('should update all appearance properties at once', async () => {
      const { space } = await testHelper.createSpace();
      const newBackground = await testHelper.createBackground();
      const newClockFont = await testHelper.createClockFont();
      const newTextFont = await testHelper.createTextFont();

      const payload = fixtures.validUpdateAppearance(newBackground.id, newClockFont.id, newTextFont.id);

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.background_id).toBe(newBackground.id);
      expect(response.body.data.clock_font_id).toBe(newClockFont.id);
      expect(response.body.data.text_font_name).toBe(newTextFont.id);
    });
  });

  describe('Tags Updates', () => {
    it('should replace space tags', async () => {
      const { space, tags } = await testHelper.createSpace();
      const newTag1 = await testHelper.createTag({ name: 'focus' });
      const newTag2 = await testHelper.createTag({ name: 'productivity' });

      const payload = fixtures.validUpdateTags([newTag1.id, newTag2.id]);

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.space_tags).toHaveLength(2);
      const tagIds = response.body.data.space_tags.map(st => st.tag.id);
      expect(tagIds).toContain(newTag1.id);
      expect(tagIds).toContain(newTag2.id);
      expect(tagIds).not.toContain(tags[0].id);
    });

    it('should reject update with empty tags array', async () => {
      const { space } = await testHelper.createSpace();

      const payload = fixtures.invalidUpdateEmptyTags();

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_2001');
      // Validation error details should indicate the tags array minimum requirement
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details.some(d => d.message.includes('At least one tag is required'))).toBe(true);
    });

    it('should reject update with invalid tag ID', async () => {
      const { space } = await testHelper.createSpace();
      const fakeTagId = '00000000-0000-0000-0000-000000000000';

      const payload = fixtures.validUpdateTags([fakeTagId]);

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_VALIDATION_FAILED);
      expect(response.body.error.message).toContain('Invalid or deleted tag');
    });
  });

  describe('Playlist Links Updates', () => {
    it('should add playlists to space', async () => {
      const { space } = await testHelper.createSpace();
      const playlist1 = await testHelper.createPlaylist({ name: 'New Playlist 1' });
      const playlist2 = await testHelper.createPlaylist({ name: 'New Playlist 2' });

      const payload = fixtures.validUpdatePlaylistLinks([playlist1.id, playlist2.id], []);

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.playlists).toHaveLength(2);
      const playlistIds = response.body.data.playlists.map(p => p.id);
      expect(playlistIds).toContain(playlist1.id);
      expect(playlistIds).toContain(playlist2.id);
    });

    it('should remove playlists from space', async () => {
      const { space } = await testHelper.createSpace();
      const playlist1 = await testHelper.createPlaylist({ space_id: space.id, name: 'Playlist 1' });
      const playlist2 = await testHelper.createPlaylist({ space_id: space.id, name: 'Playlist 2' });

      const payload = fixtures.validUpdatePlaylistLinks([], [playlist1.id]);

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      const playlistIds = response.body.data.playlists.map(p => p.id);
      expect(playlistIds).not.toContain(playlist1.id);
      expect(playlistIds).toContain(playlist2.id);
    });

    it('should add and remove playlists in same request', async () => {
      const { space } = await testHelper.createSpace();
      const existingPlaylist = await testHelper.createPlaylist({ space_id: space.id, name: 'Old Playlist' });
      const newPlaylist = await testHelper.createPlaylist({ name: 'New Playlist' });

      const payload = fixtures.validUpdatePlaylistLinks([newPlaylist.id], [existingPlaylist.id]);

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      const playlistIds = response.body.data.playlists.map(p => p.id);
      expect(playlistIds).toContain(newPlaylist.id);
      expect(playlistIds).not.toContain(existingPlaylist.id);
    });
  });

  describe('Widget Positions Updates', () => {
    it('should update widget positions', async () => {
      const { space } = await testHelper.createSpace();

      const payload = fixtures.validUpdateWidgets();

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.widget_positions).toHaveLength(2);
      expect(response.body.data.widget_positions[0].widget_id).toBe('clock');
      expect(response.body.data.widget_positions[0].position.x).toBe(150);
      expect(response.body.data.widget_positions[0].position.y).toBe(250);
    });

    it('should replace all widget positions', async () => {
      const { space } = await testHelper.createSpace();

      // Add initial widgets
      await request(app)
        .patch(`/api/space/${space.id}`)
        .send({ widgets: [{ widget_id: 'old-widget', x: 0, y: 0 }] });

      // Replace with new widgets
      const payload = fixtures.validUpdateWidgets();

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.widget_positions).toHaveLength(2);
      const widgetIds = response.body.data.widget_positions.map(w => w.widget_id);
      expect(widgetIds).not.toContain('old-widget');
    });
  });

  describe('Complete Updates', () => {
    it('should update multiple sections at once', async () => {
      const { space } = await testHelper.createSpace();
      const newTag = await testHelper.createTag({ name: 'new-tag' });
      const newBackground = await testHelper.createBackground();
      const playlist = await testHelper.createPlaylist();

      const payload = fixtures.completeUpdatePayload([newTag.id], newBackground.id, [playlist.id], []);

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(payload.metadata.name);
      expect(response.body.data.description).toBe(payload.metadata.description);
      expect(response.body.data.background_id).toBe(newBackground.id);
      expect(response.body.data.space_tags[0].tag.id).toBe(newTag.id);
      expect(response.body.data.playlists[0].id).toBe(playlist.id);
      expect(response.body.data.widget_positions).toHaveLength(1);
    });
  });

  describe('Error Cases', () => {
    it('should return 404 when space does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const payload = fixtures.validUpdateMetadata();

      const response = await request(app)
        .patch(`/api/space/${fakeId}`)
        .send(payload)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_NOT_FOUND);
    });

    it('should return 404 when updating soft-deleted space', async () => {
      const { space } = await testHelper.createSpace();

      // Delete the space
      await request(app).delete(`/api/space/${space.id}`);

      const payload = fixtures.validUpdateMetadata();

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_NOT_FOUND);
    });

    it('should return 400 when no update fields provided', async () => {
      const { space } = await testHelper.createSpace();

      const payload = fixtures.invalidUpdateNoFields();

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 422 for invalid background ID', async () => {
      const { space } = await testHelper.createSpace();
      const fakeBackgroundId = '00000000-0000-0000-0000-000000000000';

      const payload = {
        appearance: {
          background_id: fakeBackgroundId,
        },
      };

      const response = await request(app)
        .patch(`/api/space/${space.id}`)
        .send(payload)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_VALIDATION_FAILED);
    });
  });
});
