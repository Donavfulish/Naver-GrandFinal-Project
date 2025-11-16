import prisma from '../../config/prisma.js';

const textFontRepository = {
  async findById(id) {
    return await prisma.textFont.findUnique({
      where: { 
        id,
        is_deleted: false,
      },
    });
  },

  async findAll() {
    return await prisma.textFont.findMany({
      where: { is_deleted: false },
    });
  },

  async getDefault() {
    // Get the first available text font as default
    return await prisma.textFont.findFirst({
      where: { is_deleted: false },
    });
  },

  async create(data) {
    return await prisma.textFont.create({
      data,
    });
  },

  async update(id, data) {
    return await prisma.textFont.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return await prisma.textFont.update({
      where: { id },
      data: { is_deleted: true },
    });
  },
};

export default textFontRepository;
