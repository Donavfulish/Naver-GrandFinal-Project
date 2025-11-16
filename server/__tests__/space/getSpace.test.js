import request from 'supertest';
import app from '../../src/app.js';
import { testHelper } from '../helpers/testHelper.js';
import { ErrorCodes } from '../../src/constants/errorCodes.js';

describe('GET /api/space - List and Retrieve Spaces', () => {
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterAll(async () => {
    await testHelper.cleanDatabase();
    await testHelper.disconnect();
  });

  describe('GET /api/space - List Spaces', () => {
    it('should return all spaces when no filter is provided', async () => {
      const { space: space1 } = await testHelper.createSpace();
      const { space: space2 } = await testHelper.createSpace();
      const { space: space3 } = await testHelper.createSpace();

      const response = await request(app)
        .get('/api/space')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('background');
      expect(response.body.data[0]).toHaveProperty('space_tags');
    });

    it('should filter spaces by user_id', async () => {
      const user1 = await testHelper.createUser({ email: 'user1@test.com' });
      const user2 = await testHelper.createUser({ email: 'user2@test.com' });
      const tag = await testHelper.createTag();

      const { space: space1 } = await testHelper.createSpace(user1, { name: 'User1 Space' }, [tag.id]);
      const { space: space2 } = await testHelper.createSpace(user2, { name: 'User2 Space' }, [tag.id]);

      const response = await request(app)
        .get(`/api/space?user_id=${user1.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(space1.id);
      expect(response.body.data[0].user_id).toBe(user1.id);
    });

    it('should return empty array when user has no spaces', async () => {
      const user = await testHelper.createUser();

      const response = await request(app)
        .get(`/api/space?user_id=${user.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should not return soft-deleted spaces', async () => {
      const { space: space1 } = await testHelper.createSpace({ name: 'Active Space' });
      const { space: space2, user } = await testHelper.createSpace({ name: 'Deleted Space' });

      // Soft delete space2
      await request(app).delete(`/api/space/${space2.id}`);

      const response = await request(app)
        .get('/api/space')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(space1.id);
    });

    it('should return 400 for invalid user_id format', async () => {
      const response = await request(app)
        .get('/api/space?user_id=invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/space/:id - Get Single Space', () => {
    it('should return a space by ID with all relations', async () => {
      const { space, user, tags } = await testHelper.createSpace();

      const response = await request(app)
        .get(`/api/space/${space.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(space.id);
      expect(response.body.data.name).toBe(space.name);
      expect(response.body.data.description).toBe(space.description);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data).toHaveProperty('background');
      expect(response.body.data).toHaveProperty('clock');
      expect(response.body.data).toHaveProperty('text');
      expect(response.body.data).toHaveProperty('space_tags');
      expect(response.body.data).toHaveProperty('playlists');
      expect(response.body.data).toHaveProperty('widget_positions');
    });

    it('should include playlists with track information', async () => {
      const { space, user } = await testHelper.createSpace();
      const playlist = await testHelper.createPlaylist({ space_id: space.id, name: 'Test Playlist' });

      const response = await request(app)
        .get(`/api/space/${space.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.playlists).toHaveLength(1);
      expect(response.body.data.playlists[0].id).toBe(playlist.id);
      expect(response.body.data.playlists[0].name).toBe('Test Playlist');
      expect(response.body.data.playlists[0]).toHaveProperty('playlist_tracks');
    });

    it('should return 404 when space does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/space/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_NOT_FOUND);
    });

    it('should return 404 when space is soft-deleted', async () => {
      const { space } = await testHelper.createSpace();

      // Soft delete the space
      await request(app).delete(`/api/space/${space.id}`);

      const response = await request(app)
        .get(`/api/space/${space.id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_NOT_FOUND);
    });

    it('should return 400 for invalid space ID format', async () => {
      const response = await request(app)
        .get('/api/space/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not include soft-deleted child entities', async () => {
      const { space, user } = await testHelper.createSpace();
      
      // Create a playlist and then soft-delete it manually
      const playlist = await testHelper.createPlaylist({ space_id: space.id });
      await request(app).delete(`/api/space/${space.id}`);
      
      // Create a new space to test
      const { space: newSpace } = await testHelper.createSpace();

      const response = await request(app)
        .get(`/api/space/${newSpace.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Ensure soft-deleted child entities are not included
      const deletedPlaylists = response.body.data.playlists.filter(p => p.is_deleted);
      expect(deletedPlaylists).toHaveLength(0);
    });
  });
});
