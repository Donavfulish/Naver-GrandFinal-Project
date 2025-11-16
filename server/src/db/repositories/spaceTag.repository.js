import prisma from '../../config/prisma.js';

const spaceTagRepository = {
  async create(data) {
    return await prisma.spaceTag.create({
      data,
    });
  },

  async createMany(spaceTags) {
    return await prisma.spaceTag.createMany({
      data: spaceTags,
      skipDuplicates: true,
    });
  },

  async findBySpaceId(spaceId) {
    return await prisma.spaceTag.findMany({
      where: { 
        space_id: spaceId,
        is_deleted: false,
      },
      include: {
        tag: true,
      },
    });
  },

  async deleteBySpaceId(spaceId) {
    return await prisma.spaceTag.updateMany({
      where: { space_id: spaceId },
      data: { is_deleted: true },
    });
  },

  async updateBySpaceId(spaceId, tagIds) {
    // Soft delete existing tags
    await this.deleteBySpaceId(spaceId);

    // Create new tag associations
    if (tagIds && tagIds.length > 0) {
      const spaceTags = tagIds.map(tagId => ({
        space_id: spaceId,
        tag_id: tagId,
      }));
      return await this.createMany(spaceTags);
    }
    return { count: 0 };
  },
};

export default spaceTagRepository;
