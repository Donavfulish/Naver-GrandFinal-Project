import request from 'supertest';
import app from '../../src/app.js';
import { testHelper } from '../helpers/testHelper.js';
import { ErrorCodes } from '../../src/constants/errorCodes.js';
import prisma from '../../src/config/prisma.js';

describe('DELETE /api/space/:id - Delete Space', () => {
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterAll(async () => {
    await testHelper.cleanDatabase();
    await testHelper.disconnect();
  });

  describe('Success Cases', () => {
    it('should soft delete a space', async () => {
      const { space } = await testHelper.createSpace();

      const response = await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Space deleted successfully');

      // Verify space is soft-deleted in database
      const deletedSpace = await prisma.space.findUnique({
        where: { id: space.id },
      });
      expect(deletedSpace.is_deleted).toBe(true);
    });

    it('should soft delete all space tags', async () => {
      const { space } = await testHelper.createSpace();
      const tag1 = await testHelper.createTag({ name: 'tag1' });
      const tag2 = await testHelper.createTag({ name: 'tag2' });

      // Add tags to space
      await prisma.spaceTag.createMany({
        data: [
          { space_id: space.id, tag_id: tag1.id },
          { space_id: space.id, tag_id: tag2.id },
        ],
      });

      await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(200);

      // Verify space tags are soft-deleted
      const spaceTags = await prisma.spaceTag.findMany({
        where: { space_id: space.id },
      });
      expect(spaceTags.every(st => st.is_deleted)).toBe(true);
    });

    it('should soft delete all widget positions', async () => {
      const { space } = await testHelper.createSpace();

      // Add widget positions
      await prisma.widgetPosition.createMany({
        data: [
          {
            space_id: space.id,
            widget_id: 'clock',
            position: { x: 100, y: 200 },
          },
          {
            space_id: space.id,
            widget_id: 'player',
            position: { x: 300, y: 400 },
          },
        ],
      });

      await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(200);

      // Verify widget positions are soft-deleted
      const widgets = await prisma.widgetPosition.findMany({
        where: { space_id: space.id },
      });
      expect(widgets.every(w => w.is_deleted)).toBe(true);
    });

    it('should detach playlists (set space_id to null)', async () => {
      const { space } = await testHelper.createSpace();
      const playlist1 = await testHelper.createPlaylist({ space_id: space.id, name: 'Playlist 1' });
      const playlist2 = await testHelper.createPlaylist({ space_id: space.id, name: 'Playlist 2' });

      await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(200);

      // Verify playlists are detached but NOT deleted
      const playlists = await prisma.playlist.findMany({
        where: { id: { in: [playlist1.id, playlist2.id] } },
      });
      
      expect(playlists).toHaveLength(2);
      expect(playlists.every(p => p.space_id === null)).toBe(true);
      expect(playlists.every(p => p.is_deleted === false)).toBe(true);
    });

    it('should preserve playlist tracks when deleting space', async () => {
      const { space } = await testHelper.createSpace();
      const playlist = await testHelper.createPlaylist({ space_id: space.id });
      
      // Create a track and add to playlist
      const track = await prisma.track.create({
        data: { spotify_track_id: 'spotify:track:123' },
      });
      await prisma.playlistTrack.create({
        data: {
          playlist_id: playlist.id,
          track_id: track.id,
          track_order: 1,
        },
      });

      await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(200);

      // Verify tracks and playlist tracks are preserved
      const savedTrack = await prisma.track.findUnique({
        where: { id: track.id },
      });
      expect(savedTrack).not.toBeNull();
      expect(savedTrack.is_deleted).toBe(false);

      const playlistTracks = await prisma.playlistTrack.findMany({
        where: { playlist_id: playlist.id },
      });
      expect(playlistTracks).toHaveLength(1);
      expect(playlistTracks[0].is_deleted).toBe(false);
    });

    it('should make space inaccessible via GET after deletion', async () => {
      const { space } = await testHelper.createSpace();

      // Delete the space
      await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(200);

      // Try to retrieve it
      const response = await request(app)
        .get(`/api/space/${space.id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_NOT_FOUND);
    });

    it('should exclude deleted space from list endpoint', async () => {
      const { space: space1 } = await testHelper.createSpace();
      const { space: space2 } = await testHelper.createSpace();

      // Delete one space
      await request(app).delete(`/api/space/${space1.id}`);

      // List all spaces
      const response = await request(app)
        .get('/api/space')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(space2.id);
    });
  });

  describe('Error Cases', () => {
    it('should return 404 when space does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/space/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_NOT_FOUND);
    });

    it('should return 404 when deleting already deleted space (idempotent)', async () => {
      const { space } = await testHelper.createSpace();

      // Delete once
      await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(200);

      // Try to delete again
      const response = await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ErrorCodes.SPACE_NOT_FOUND);
    });

    it('should return 400 for invalid space ID format', async () => {
      const response = await request(app)
        .delete('/api/space/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Transactional Integrity', () => {
    it('should delete all related entities in single transaction', async () => {
      const { space } = await testHelper.createSpace();
      const tag = await testHelper.createTag();
      const playlist = await testHelper.createPlaylist({ space_id: space.id });

      // Add space tags and widgets
      await prisma.spaceTag.create({
        data: { space_id: space.id, tag_id: tag.id },
      });
      await prisma.widgetPosition.create({
        data: {
          space_id: space.id,
          widget_id: 'clock',
          position: { x: 100, y: 100 },
        },
      });

      await request(app)
        .delete(`/api/space/${space.id}`)
        .expect(200);

      // Verify all entities processed together
      const deletedSpace = await prisma.space.findUnique({ where: { id: space.id } });
      const spaceTags = await prisma.spaceTag.findMany({ where: { space_id: space.id } });
      const widgets = await prisma.widgetPosition.findMany({ where: { space_id: space.id } });
      const detachedPlaylist = await prisma.playlist.findUnique({ where: { id: playlist.id } });

      expect(deletedSpace.is_deleted).toBe(true);
      expect(spaceTags.every(st => st.is_deleted)).toBe(true);
      expect(widgets.every(w => w.is_deleted)).toBe(true);
      expect(detachedPlaylist.space_id).toBeNull();
    });
  });
});
