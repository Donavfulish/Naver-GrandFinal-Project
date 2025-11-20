import prisma from '../../src/config/prisma.js';

/**
 * Test database setup and teardown helpers
 */
export const testHelper = {
  /**
   * Clean up all test data from the database
   */
  async cleanDatabase() {
    // Order matters due to foreign key constraints
    await prisma.widgetPosition.deleteMany();
    await prisma.spaceTag.deleteMany();
    await prisma.playlistTrack.deleteMany();
    await prisma.playlist.deleteMany();
    await prisma.forkSpace.deleteMany();
    await prisma.space.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.background.deleteMany();
    await prisma.clockFont.deleteMany();
    await prisma.textFont.deleteMany();
    await prisma.track.deleteMany();
    await prisma.user.deleteMany();
  },

  /**
   * Create a test user
   */
  async createUser(data = {}) {
    return await prisma.user.create({
      data: {
        name: data.name || 'Test User',
        email: data.email || `test-${Date.now()}@example.com`,
        password_hash: data.password_hash || 'hashed_password',
        avatar_url: data.avatar_url || null,
        ...(data.id ? {} : data), // Don't include id if provided
      },
    });
  },

  /**
   * Create a test tag
   */
  async createTag(data = {}) {
    return await prisma.tag.create({
      data: {
        name: data.name || `tag-${Date.now()}`,
        ...data,
      },
    });
  },

  /**
   * Create a test background
   */
  async createBackground(data = {}) {
    return await prisma.background.create({
      data: {
        background_url: data.background_url || 'https://example.com/bg.jpg',
        ...data,
      },
    });
  },

  /**
   * Create a test clock font
   */
  async createClockFont(data = {}) {
    return await prisma.clockFont.create({
      data: {
        font_name: data.font_name || 'Roboto',
        ...data,
      },
    });
  },

  /**
   * Create a test text font
   */
  async createTextFont(data = {}) {
    return await prisma.textFont.create({
      data: {
        font_name: data.font_name || 'Arial',
        ...data,
      },
    });
  },

  /**
   * Create a test playlist
   */
  async createPlaylist(data = {}) {
    return await prisma.playlist.create({
      data: {
        space_id: data.space_id || null,
        name: data.name || 'Test Playlist',
        ...data,
      },
    });
  },

  /**
   * Create a complete test space with all relations
   * @param {object} userOrUserData - Either an existing user object with {id, email, name} or data to create a new user
   * @param {object} spaceData - Space data
   * @param {array} tagIds - Array of tag IDs
   */
  async createSpace(userOrUserData = {}, spaceData = {}, tagIds = []) {
    // If userData has an id property, treat it as an existing user
    // Otherwise, create a new user
    const user = userOrUserData.id && userOrUserData.email
      ? userOrUserData
      : await this.createUser(userOrUserData);
    
    let tags = [];
    if (tagIds.length === 0) {
      const tag = await this.createTag();
      tags = [tag];
    } else {
      tags = await Promise.all(
        tagIds.map(id => prisma.tag.findUnique({ where: { id } }))
      );
    }

    const background = await this.createBackground();
    const clockFont = await this.createClockFont();
    const textFont = await this.createTextFont();

    const space = await prisma.space.create({
      data: {
        user_id: user.id,
        name: spaceData.name || 'Test Space',
        description: spaceData.description || 'Test Description',
        background_id: spaceData.background_id || background.id,
        clock_font_id: spaceData.clock_font_id || clockFont.id,
        text_font_name: spaceData.text_font_name || textFont.id,
        ...spaceData,
      },
    });

    // Create space-tag associations
    await prisma.spaceTag.createMany({
      data: tags.map(tag => ({
        space_id: space.id,
        tag_id: tag.id,
      })),
    });

    return {
      user,
      space,
      tags,
      background,
      clockFont,
      textFont,
    };
  },

  /**
   * Disconnect from database
   */
  async disconnect() {
    await prisma.$disconnect();
  },
};
