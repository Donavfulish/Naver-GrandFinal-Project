import prisma from '../../config/prisma.js';

const playlistRepository = {
  async create(data) {
    return await prisma.playlist.create({
      data,
      include: {
        space: true,
        playlist_tracks: {
          where: { is_deleted: false },
          include: {
            track: true,
          },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async findById(id) {
    return await prisma.playlist.findUnique({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        space: true,
        playlist_tracks: {
          where: { is_deleted: false },
          include: {
            track: true,
          },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async findAll(filters = {}) {
    return await prisma.playlist.findMany({
      where: {
        ...filters,
        is_deleted: false,
      },
      include: {
        space: true,
        playlist_tracks: {
          where: { is_deleted: false },
          include: {
            track: true,
          },
          orderBy: { track_order: 'asc' },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  },

  async findBySpaceId(spaceId) {
    return await prisma.playlist.findMany({
      where: {
        space_id: spaceId,
        is_deleted: false,
      },
      include: {
        playlist_tracks: {
          where: { is_deleted: false },
          include: {
            track: true,
          },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async update(id, data) {
    return await prisma.playlist.update({
      where: { id },
      data,
      include: {
        space: true,
        playlist_tracks: {
          where: { is_deleted: false },
          include: {
            track: true,
          },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async delete(id) {
    return await prisma.playlist.update({
      where: { id },
      data: { is_deleted: true },
    });
  },

  async addTracks(playlistId, trackIds) {
    // Get current max order
    const maxOrderTrack = await prisma.playlistTrack.findFirst({
      where: { playlist_id: playlistId, is_deleted: false },
      orderBy: { track_order: 'desc' },
    });

    const startOrder = maxOrderTrack ? maxOrderTrack.track_order + 1 : 1;

    // Add new tracks
    await prisma.playlistTrack.createMany({
      data: trackIds.map((trackId, index) => ({
        playlist_id: playlistId,
        track_id: trackId,
        track_order: startOrder + index,
        is_deleted: false,
      })),
      skipDuplicates: true,
    });

    return await this.findById(playlistId);
  },

  async removeTracks(playlistId, trackIds) {
    await prisma.playlistTrack.updateMany({
      where: {
        playlist_id: playlistId,
        track_id: { in: trackIds },
      },
      data: { is_deleted: true },
    });

    return await this.findById(playlistId);
  },

  async reorderTracks(playlistId, trackOrders) {
    // trackOrders is an array of { track_id, track_order }
    for (const { track_id, track_order } of trackOrders) {
      await prisma.playlistTrack.updateMany({
        where: {
          playlist_id: playlistId,
          track_id: track_id,
        },
        data: { track_order },
      });
    }

    return await this.findById(playlistId);
  },
};

export default playlistRepository;
