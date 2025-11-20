import prisma from '../../config/prisma.js';

const backgroundRepository = {
  async create(data) {
    return await prisma.background.create({
      data,
    });
  },

  async findById(id) {
    return await prisma.background.findUnique({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  async findAll(filters = {}) {
    return await prisma.background.findMany({
      where: {
        ...filters,
        is_deleted: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  },

  async update(id, data) {
    return await prisma.background.update({
      where: {
        id,
        is_deleted: false,
      },
      data,
    });
  },

  async delete(id) {
    return await prisma.background.update({
      where: {
        id,
        is_deleted: false,
      },
      data: { is_deleted: true },
    });
  },

  async search({ tags, emotion, source, limit = 20, offset = 0 }) {
    const whereConditions = {
      is_deleted: false,
    };

    const andConditions = [];

    // Filter by tags
    if (tags && tags.length > 0) {
      andConditions.push({
        tags: {
          hasSome: tags,
        },
      });
    }

    // Filter by emotion
    if (emotion && emotion.length > 0) {
      andConditions.push({
        emotion: {
          hasSome: emotion,
        },
      });
    }

    // Filter by source
    if (source) {
      andConditions.push({
        source: source,
      });
    }

    if (andConditions.length > 0) {
      whereConditions.AND = andConditions;
    }

    const [backgrounds, total] = await Promise.all([
      prisma.background.findMany({
        where: whereConditions,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.background.count({
        where: whereConditions,
      }),
    ]);

    return {
      backgrounds,
      total,
      limit,
      offset,
    };
  },
};

export default backgroundRepository;
