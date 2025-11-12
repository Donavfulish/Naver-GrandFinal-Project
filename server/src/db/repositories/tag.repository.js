import prisma from '../../config/prisma.js';

const tagRepository = {
  async create(data) {
    return await prisma.tag.create({
      data,
    });
  },

  async findById(id) {
    return await prisma.tag.findUnique({
      where: { id },
      include: {
        space_tags: { include: { space: true } },
      },
    });
  },

  async findByName(name) {
    return await prisma.tag.findUnique({
      where: { name },
    });
  },

  async findAll() {
    return await prisma.tag.findMany();
  },

  async update(id, data) {
    return await prisma.tag.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return await prisma.tag.delete({
      where: { id },
    });
  },

  async findOrCreate(name) {
    return await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  },
};

export default tagRepository;

