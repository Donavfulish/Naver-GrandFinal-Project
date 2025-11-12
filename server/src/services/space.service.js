import spaceRepository from '../db/repositories/space.repository.js';

const spaceService = {
  async createSpace(data) {
    const space = await spaceRepository.create(data);
    return space;
  },

  async getSpaceById(id) {
    const space = await spaceRepository.findById(id);
    if (!space) {
      throw new Error('Space not found');
    }
    return space;
  },

  async getAllSpaces(filters) {
    return await spaceRepository.findAll(filters);
  },

  async getSpacesByUserId(userId) {
    return await spaceRepository.findByUserId(userId);
  },

  async updateSpace(id, data) {
    const space = await spaceRepository.findById(id);
    if (!space) {
      throw new Error('Space not found');
    }
    return await spaceRepository.update(id, data);
  },

  async deleteSpace(id) {
    const space = await spaceRepository.findById(id);
    if (!space) {
      throw new Error('Space not found');
    }
    await spaceRepository.delete(id);
    return { message: 'Space deleted successfully' };
  },
};

export default spaceService;

