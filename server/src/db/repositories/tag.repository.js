import prisma from '../../config/prisma.js';

const tagRepository = {
  async create(data) {
    return await prisma.tag.create({
      data: {
        ...data,
        is_deleted: false,
      },
    });
  },

  async findById(id) {
    return await prisma.tag.findFirst({
      where: {
        id,
        is_deleted: false
      },
      include: {
        space_tags: {
          where: { is_deleted: false },
          include: {
            space: {
              where: { is_deleted: false },
            },
          },
        },
      },
    });
  },

  async findByName(name) {
    return await prisma.tag.findFirst({
      where: {
        name,
        is_deleted: false
      },
    });
  },

  async findAll() {
    return await prisma.tag.findMany({
      where: { is_deleted: false },
      orderBy: {
        created_at: 'desc',
      },
    });
  },

  async update(id, data) {
    return await prisma.tag.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return await prisma.tag.update({
      where: { id },
      data: { is_deleted: true },
    });
  },

  async findOrCreate(name) {
    return await prisma.tag.upsert({
      where: { name },
      update: {},
      create: {
        name,
        is_deleted: false
      },
    });
  },
};

export default tagRepository;
