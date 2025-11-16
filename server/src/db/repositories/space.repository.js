import prisma from '../../config/prisma.js';

const spaceRepository = {
  async create(spaceData, tagIds = [], playlistIds = [], widgetPositions = []) {
    return await prisma.$transaction(async (tx) => {
      // Create the space
      const space = await tx.space.create({
        data: spaceData,
      });

      // Create space-tag associations
      if (tagIds.length > 0) {
        await tx.spaceTag.createMany({
          data: tagIds.map(tagId => ({
            space_id: space.id,
            tag_id: tagId,
          })),
        });
      }

      // Link playlists to space
      if (playlistIds.length > 0) {
        await tx.playlist.updateMany({
          where: {
            id: { in: playlistIds },
          },
          data: {
            space_id: space.id,
          },
        });
      }

      // Create widget positions
      if (widgetPositions.length > 0) {
        await tx.widgetPosition.createMany({
          data: widgetPositions.map(widget => ({
            space_id: space.id,
            widget_id: widget.widget_id,
            position: {
              x: widget.x,
              y: widget.y,
              metadata: widget.metadata || {},
            },
          })),
        });
      }

      // Fetch the complete space with all relations
      return await tx.space.findUnique({
        where: { id: space.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          background: true,
          clock: true,
          text: true,
          widget_positions: {
            where: { is_deleted: false },
          },
          playlists: {
            where: { is_deleted: false },
            include: {
              playlist_tracks: {
                where: { is_deleted: false },
                include: { track: true },
                orderBy: { track_order: 'asc' },
              },
            },
          },
          space_tags: {
            where: { is_deleted: false },
            include: { tag: true },
          },
        },
      });
    });
  },

  async findById(id) {
    return await prisma.space.findUnique({
      where: { 
        id,
        is_deleted: false,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        background: true,
        clock: true,
        text: true,
        widget_positions: {
          where: { is_deleted: false },
        },
        playlists: {
          where: { is_deleted: false },
          include: {
            playlist_tracks: {
              where: { is_deleted: false },
              include: { track: true },
              orderBy: { track_order: 'asc' },
            },
          },
        },
        space_tags: {
          where: { is_deleted: false },
          include: { tag: true },
        },
      },
    });
  },

  async findAll(filters = {}) {
    return await prisma.space.findMany({
      where: {
        ...filters,
        is_deleted: false,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        background: true,
        space_tags: {
          where: { is_deleted: false },
          include: { tag: true },
        },
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

  async update(id, spaceData, tagIds = null, playlistLinksAdd = [], playlistLinksRemove = [], widgetPositions = null) {
    return await prisma.$transaction(async (tx) => {
      // Update space metadata/appearance
      if (Object.keys(spaceData).length > 0) {
        await tx.space.update({
          where: { id },
          data: spaceData,
        });
      }

      // Update tags if provided
      if (tagIds !== null) {
        // Soft delete existing tags
        await tx.spaceTag.updateMany({
          where: { space_id: id },
          data: { is_deleted: true },
        });

        // Create new tag associations
        if (tagIds.length > 0) {
          await tx.spaceTag.createMany({
            data: tagIds.map(tagId => ({
              space_id: id,
              tag_id: tagId,
            })),
          });
        }
      }

      // Add playlist links
      if (playlistLinksAdd.length > 0) {
        await tx.playlist.updateMany({
          where: {
            id: { in: playlistLinksAdd },
          },
          data: {
            space_id: id,
          },
        });
      }

      // Remove playlist links
      if (playlistLinksRemove.length > 0) {
        await tx.playlist.updateMany({
          where: {
            id: { in: playlistLinksRemove },
            space_id: id,
          },
          data: {
            space_id: null,
          },
        });
      }

      // Update widget positions if provided
      if (widgetPositions !== null) {
        // Soft delete existing positions
        await tx.widgetPosition.updateMany({
          where: { space_id: id },
          data: { is_deleted: true },
        });

        // Create new positions
        if (widgetPositions.length > 0) {
          await tx.widgetPosition.createMany({
            data: widgetPositions.map(widget => ({
              space_id: id,
              widget_id: widget.widget_id,
              position: {
                x: widget.x,
                y: widget.y,
                metadata: widget.metadata || {},
              },
            })),
          });
        }
      }

      // Fetch updated space with all relations
      return await tx.space.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          background: true,
          clock: true,
          text: true,
          widget_positions: {
            where: { is_deleted: false },
          },
          playlists: {
            where: { is_deleted: false },
            include: {
              playlist_tracks: {
                where: { is_deleted: false },
                include: { track: true },
                orderBy: { track_order: 'asc' },
              },
            },
          },
          space_tags: {
            where: { is_deleted: false },
            include: { tag: true },
          },
        },
      });
    });
  },

  async delete(id) {
    return await prisma.$transaction(async (tx) => {
      // Soft delete the space
      await tx.space.update({
        where: { id },
        data: { is_deleted: true },
      });

      // Soft delete space tags
      await tx.spaceTag.updateMany({
        where: { space_id: id },
        data: { is_deleted: true },
      });

      // Soft delete widget positions
      await tx.widgetPosition.updateMany({
        where: { space_id: id },
        data: { is_deleted: true },
      });

      // Detach playlists (set space_id to null instead of deleting)
      await tx.playlist.updateMany({
        where: { space_id: id },
        data: { space_id: null },
      });

      return { success: true };
    });
  },

  async search({ q, title, tag, author, limit = 20, offset = 0 }) {
    const whereConditions = {
      is_deleted: false,
    };

    // Build AND conditions
    const andConditions = [];

    // General search query (searches in title and description)
    if (q) {
      andConditions.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Specific title search
    if (title) {
      andConditions.push({
        name: { contains: title, mode: 'insensitive' },
      });
    }

    // Filter by author (user_id)
    if (author) {
      andConditions.push({
        user_id: author,
      });
    }

    // Filter by tag
    if (tag) {
      andConditions.push({
        space_tags: {
          some: {
            tag_id: tag,
            is_deleted: false,
          },
        },
      });
    }

    // Add all conditions to where clause
    if (andConditions.length > 0) {
      whereConditions.AND = andConditions;
    }

    // Execute query with pagination
    const [spaces, total] = await Promise.all([
      prisma.space.findMany({
        where: whereConditions,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar_url: true },
            where: { is_deleted: false },
          },
          background: {
            where: { is_deleted: false },
          },
          space_tags: {
            where: { is_deleted: false },
            include: {
              tag: {
                where: { is_deleted: false },
              },
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.space.count({
        where: whereConditions,
      }),
    ]);

    return {
      spaces,
      total,
      limit,
      offset,
    };
  },
};

export default spaceRepository;
