import prisma from '../../config/prisma.js';

const spaceRepository = {
  async create(data) {
    return await prisma.space.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        background: true,
        clock: true,
        text: true,
      },
    });
  },

  async findById(id) {
    return await prisma.space.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        background: true,
        clock: true,
        text: true,
        widget_positions: true,
        playlists: true,
        space_tags: { include: { tag: true } },
      },
    });
  },

  async findAll(filters = {}) {
    return await prisma.space.findMany({
      where: filters,
      include: {
        user: { select: { id: true, name: true, email: true } },
        background: true,
        space_tags: { include: { tag: true } },
      },
    });
  },

  async findByUserId(userId) {
    return await prisma.space.findMany({
      where: { user_id: userId },
      include: {
        background: true,
        space_tags: { include: { tag: true } },
      },
    });
  },

  async update(id, data) {
    return await prisma.space.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        background: true,
      },
    });
  },

  async delete(id) {
    return await prisma.space.update({
      where: { id },
      data: { is_deleted: true },
    });
  },
};

export default spaceRepository;
