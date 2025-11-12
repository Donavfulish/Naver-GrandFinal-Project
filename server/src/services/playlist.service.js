import playlistRepository from '../db/repositories/playlist.repository.js';
import trackRepository from '../db/repositories/track.repository.js';

const playlistService = {
  async createPlaylist(data) {
    return await playlistRepository.create(data);
  },

  async getPlaylistById(id) {
    const playlist = await playlistRepository.findById(id);
    if (!playlist) {
      throw new Error('Playlist not found');
    }
    return playlist;
  },

  async getAllPlaylists(filters) {
    return await playlistRepository.findAll(filters);
  },

  async getPlaylistsBySpaceId(spaceId) {
    return await playlistRepository.findBySpaceId(spaceId);
  },

  async updatePlaylist(id, data) {
    const playlist = await playlistRepository.findById(id);
    if (!playlist) {
      throw new Error('Playlist not found');
    }
    return await playlistRepository.update(id, data);
  },

  async deletePlaylist(id) {
    const playlist = await playlistRepository.findById(id);
    if (!playlist) {
      throw new Error('Playlist not found');
    }
    await playlistRepository.delete(id);
    return { message: 'Playlist deleted successfully' };
  },

  async addTrackToPlaylist(playlistId, spotifyTrackId, trackOrder) {
    const playlist = await playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // Find or create track
    const track = await trackRepository.findOrCreate(spotifyTrackId);

    return await playlistRepository.addTrack(playlistId, track.id, trackOrder);
  },

  async removeTrackFromPlaylist(playlistId, trackId) {
    const playlist = await playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    await playlistRepository.removeTrack(playlistId, trackId);
    return { message: 'Track removed from playlist' };
  },
};

export default playlistService;

