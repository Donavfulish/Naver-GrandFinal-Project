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
            track: {
              where: { is_deleted: false },
            },
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
            track: {
              where: { is_deleted: false },
            },
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
            track: {
              where: { is_deleted: false },
            },
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
            track: {
              where: { is_deleted: false },
            },
          },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async update(id, data) {
    return await prisma.playlist.update({
      where: {
        id,
        is_deleted: false,
      },
      data,
    });
  },

  async delete(id) {
    return await prisma.playlist.update({
      where: {
        id,
        is_deleted: false,
      },
      data: { is_deleted: true },
    });
  },

  async addTrack(playlistId, trackId, trackOrder) {
    return await prisma.playlistTrack.create({
      data: {
        playlist_id: playlistId,
        track_id: trackId,
        track_order: trackOrder,
      },
      include: { track: true },
    });
  },

  async removeTrack(playlistId, trackId) {
    return await prisma.playlistTrack.updateMany({
      where: {
        playlist_id: playlistId,
        track_id: trackId,
        is_deleted: false,
      },
      data: {
        is_deleted: true,
      },
    });
  },
};

export default playlistRepository;
