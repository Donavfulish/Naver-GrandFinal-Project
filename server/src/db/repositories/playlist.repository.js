import prisma from '../../config/prisma.js';

const playlistRepository = {
  async create(data) {
    return await prisma.playlist.create({
      data,
      include: {
        space: true,
        playlist_tracks: {
          include: { track: true },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async findById(id) {
    return await prisma.playlist.findUnique({
      where: { id },
      include: {
        space: true,
        playlist_tracks: {
          include: { track: true },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async findAll(filters = {}) {
    return await prisma.playlist.findMany({
      where: filters,
      include: {
        space: true,
        playlist_tracks: {
          include: { track: true },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async findBySpaceId(spaceId) {
    return await prisma.playlist.findMany({
      where: { space_id: spaceId },
      include: {
        playlist_tracks: {
          include: { track: true },
          orderBy: { track_order: 'asc' },
        },
      },
    });
  },

  async update(id, data) {
    return await prisma.playlist.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return await prisma.playlist.delete({
      where: { id },
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
    return await prisma.playlistTrack.deleteMany({
      where: {
        playlist_id: playlistId,
        track_id: trackId,
      },
    });
  },
};

export default playlistRepository;

