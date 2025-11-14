import backgroundRepository from '../db/repositories/background.repository.js';

const backgroundService = {
  async createBackground(data) {
    return await backgroundRepository.create(data);
  },

  async getBackgroundById(id) {
    const background = await backgroundRepository.findById(id);
    if (!background) {
      throw new Error('Background not found');
    }
    return background;
  },

  async getAllBackgrounds() {
    return await backgroundRepository.findAll();
  },

  async updateBackground(id, data) {
    const background = await backgroundRepository.findById(id);
    if (!background) {
      throw new Error('Background not found');
    }
    return await backgroundRepository.update(id, data);
  },

  async deleteBackground(id) {
    const background = await backgroundRepository.findById(id);
    if (!background) {
      throw new Error('Background not found');
    }
    await backgroundRepository.delete(id);
    return { message: 'Background deleted successfully' };
  },
};

export default backgroundService;

