import bcryptjs from 'bcryptjs';
import userRepository from '../db/repositories/user.repository.js';

const userService = {
  // Đăng ký user mới
  async register(name, email, password) {
    // Kiểm tra email đã tồn tại
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const password_hash = await bcryptjs.hash(password, 10);

    // Tạo user mới
    const user = await userRepository.create({
      name,
      email,
      password_hash,
    });

    // Trả về user không có password
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Đăng nhập
  async login(email, password) {
    // Tìm user theo email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Kiểm tra password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Trả về user không có password
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Lấy thông tin user
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Lấy toàn bộ spaces của user
    async getSpacesByUserId(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return await userRepository.findSpacesByUserId(userId);
    },

  // Cập nhật thông tin user
  async updateUser(id, data) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Nếu có password mới, hash nó
    if (data.password) {
      data.password_hash = await bcryptjs.hash(data.password, 10);
      delete data.password;
    }

    const updatedUser = await userRepository.update(id, data);
    const { password_hash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  // Xóa user
  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await userRepository.delete(id);
    return { message: 'User deleted successfully' };
  },
};

export default userService;
