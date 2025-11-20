import prisma from '../../config/prisma.js';

const userRepository = {
  // Tạo user mới
  async create(data) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: data.password_hash,
      },
    });
  },

  // Tìm user theo ID
  async findById(id) {
    return await prisma.user.findUnique({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  // Tìm user theo email
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: {
        email,
        is_deleted: false,
      },
    });
  },

  // Lấy tất cả users
  async findAll() {
    return await prisma.user.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  },

  // Cập nhật user
  async update(id, data) {
    return await prisma.user.update({
      where: {
        id,
        is_deleted: false,
      },
      data,
    });
  },

  // Xóa user (soft delete)
  async delete(id) {
    return await prisma.user.update({
      where: {
        id,
        is_deleted: false,
      },
      data: { is_deleted: true },
    });
  },

  // Kiểm tra email có tồn tại không
  async existsByEmail(email) {
    const count = await prisma.user.count({
      where: {
        email,
        is_deleted: false,
      },
    });
    return count > 0;
  },

  // Lấy toàn bộ spaces của user
  async findSpacesByUserId(userId) {
    return await prisma.space.findMany({
      where: {
        user_id: userId,
        is_deleted: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        mood: true,
        created_at: true,
        updated_at: true,
        background: {
          select: {
            id: true,
            background_url: true,
          },
        },
        space_tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        AiGeneratedContent: {
          select: {
            id: true,
            content: true
          }
        }
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
};

export default userRepository;
