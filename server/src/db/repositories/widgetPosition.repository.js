import prisma from '../../config/prisma.js';

const widgetPositionRepository = {
  async create(data) {
    return await prisma.widgetPosition.create({
      data,
    });
  },

  async createMany(positions) {
    return await prisma.widgetPosition.createMany({
      data: positions,
      skipDuplicates: true,
    });
  },

  async findBySpaceId(spaceId) {
    return await prisma.widgetPosition.findMany({
      where: { 
        space_id: spaceId,
        is_deleted: false,
      },
    });
  },

  async updateMany(spaceId, positions) {
    // First, soft delete all existing positions
    await prisma.widgetPosition.updateMany({
      where: { space_id: spaceId },
      data: { is_deleted: true },
    });

    // Then create new positions
    if (positions && positions.length > 0) {
      return await this.createMany(positions);
    }
    return { count: 0 };
  },

  async deleteBySpaceId(spaceId) {
    return await prisma.widgetPosition.updateMany({
      where: { space_id: spaceId },
      data: { is_deleted: true },
    });
  },
};

export default widgetPositionRepository;
