import prisma from '../../config/prisma.js';

const clockFontRepository = {
  async findById(id) {
    return await prisma.clockFont.findUnique({
      where: { 
        id,
        is_deleted: false,
      },
    });
  },

  async findAll() {
    return await prisma.clockFont.findMany({
      where: { is_deleted: false },
    });
  },

  async getDefault() {
    // Get the first available clock font as default
    return await prisma.clockFont.findFirst({
      where: { is_deleted: false },
    });
  },

  async create(data) {
    return await prisma.clockFont.create({
      data,
    });
  },

  async update(id, data) {
    return await prisma.clockFont.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return await prisma.clockFont.update({
      where: { id },
      data: { is_deleted: true },
    });
  },
};

export default clockFontRepository;
