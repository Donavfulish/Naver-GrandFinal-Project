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
      where: { id },
    });
  },

  // Tìm user theo email
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  // Lấy tất cả users
  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  // Cập nhật user
  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  // Xóa user (soft delete)
  async delete(id) {
    return await prisma.user.update({
      where: { id },
      data: { is_deleted: true },
    });
  },

  // Kiểm tra email có tồn tại không
  async existsByEmail(email) {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  },
};

export default userRepository;
