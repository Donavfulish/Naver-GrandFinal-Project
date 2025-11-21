import prisma from '../../config/prisma.js';

const trackRepository = {
  async create(data) {
    return await prisma.track.create({
      data,
    });
  },

  async findById(id) {
    return await prisma.track.findUnique({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  async findAll(filters = {}) {
    return await prisma.track.findMany({
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
    return await prisma.track.update({
      where: {
        id,
        is_deleted: false,
      },
      data,
    });
  },

  async delete(id) {
    return await prisma.track.update({
      where: {
        id,
        is_deleted: false,
      },
      data: { is_deleted: true },
    });
  },

  async search({ q, name, tags, emotion, source, limit = 20, offset = 0 }) {
    const whereConditions = {
      is_deleted: false,
    };

    const andConditions = [];

    // General search query (searches in name)
    if (q) {
      andConditions.push({
        name: { contains: q, mode: 'insensitive' },
      });
    }

    // Specific name search
    if (name) {
      andConditions.push({
        name: { contains: name, mode: 'insensitive' },
      });
    }

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

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where: whereConditions,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.track.count({
        where: whereConditions,
      }),
    ]);

    return {
      tracks,
      total,
      limit,
      offset,
    };
  },
};

export default trackRepository;
