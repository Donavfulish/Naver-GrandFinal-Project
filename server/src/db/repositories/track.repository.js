import prisma from '../../config/prisma.js';

const trackRepository = {
  async create(data) {
    return await prisma.track.create({
      data,
    });
  },

  async findById(id) {
    return await prisma.track.findUnique({
      where: { id },
    });
  },

  async findBySpotifyId(spotifyTrackId) {
    return await prisma.track.findUnique({
      where: { spotify_track_id: spotifyTrackId },
    });
  },

  async findAll() {
    return await prisma.track.findMany();
  },

  async update(id, data) {
    return await prisma.track.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return await prisma.track.update({
      where: { id },
      data: { is_deleted: true },
    });
  },

  async findOrCreate(spotifyTrackId) {
    return await prisma.track.upsert({
      where: { spotify_track_id: spotifyTrackId },
      update: {},
      create: { spotify_track_id: spotifyTrackId },
    });
  },
};

export default trackRepository;
