import prisma from '../../config/prisma.js';

const backgroundRepository = {
  async create(data) {
    return await prisma.background.create({
      data,
    });
  },

  async findById(id) {
    return await prisma.background.findUnique({
      where: { id },
    });
  },

  async findAll() {
    return await prisma.background.findMany();
  },

  async update(id, data) {
    return await prisma.background.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return await prisma.background.delete({
      where: { id },
    });
  },
};

export default backgroundRepository;

