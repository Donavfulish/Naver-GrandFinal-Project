import prisma from '../../config/prisma.js';

const spaceRepository = {
  async create(spaceData, tagIds = [], trackIds = []) {
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

      // Create playlist with tracks if provided
      if (trackIds.length > 0) {
        const playlist = await tx.playlist.create({
          data: {
            space_id: space.id,
            name: `${spaceData.name} - Playlist`,
            is_deleted: false,
          },
        });

        // Add tracks to playlist
        await tx.playlistTrack.createMany({
          data: trackIds.map((trackId, index) => ({
            playlist_id: playlist.id,
            track_id: trackId,
            track_order: index + 1,
            is_deleted: false,
          })),
        });
      }

      // Fetch the complete space with all relations
      return await tx.space.findUnique({
        where: { id: space.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true
            }
          },
          background: {
            select: {
              id: true,
              background_url: true,
              emotion: true,
              tags: true,
              source: true,
            },
          },
          clock: {
            select: {
              id: true,
              style: true,
            },
          },
          text: {
            select: {
              id: true,
              font_name: true,
            },
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
            include: { tag: true },
          },
          notes: {
            where: { is_deleted: false },
            select: {
              id: true,
              content: true,
              note_order: true,
              created_at: true,
              updated_at: true,
            },
            orderBy: { note_order: 'asc' },
          },
        },
      });
    });
  },

  async findById(id) {
    return await prisma.space.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true
          }
        },
        background: {
          select: {
            id: true,
            background_url: true,
            emotion: true,
            tags: true,
            source: true,
          },
        },
        clock: {
          select: {
            id: true,
            style: true,
          },
        },
        text: {
          select: {
            id: true,
            font_name: true,
          },
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
          include: { tag: true },
        },
        notes: {
          where: { is_deleted: false },
          select: {
            id: true,
            content: true,
            note_order: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: { note_order: 'asc' },
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true
          }
        },
        background: {
          select: {
            id: true,
            background_url: true,
            emotion: true,
            tags: true,
            source: true,
          },
        },
        clock: {
          select: {
            id: true,
            style: true,
          },
        },
        text: {
          select: {
            id: true,
            font_name: true,
          },
        },
        space_tags: {
          include: { tag: true },
        },
        notes: {
          where: { is_deleted: false },
          select: {
            id: true,
            content: true,
            note_order: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: { note_order: 'asc' },
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

  async update(id, spaceData, tagIds = null, playlistLinksAdd = [], playlistLinksRemove = []) {
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
        // Delete existing tags (hard delete since no soft delete field)
        await tx.spaceTag.deleteMany({
          where: { space_id: id },
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

      // Fetch updated space with all relations
      return await tx.space.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true
            }
          },
          background: {
            select: {
              id: true,
              background_url: true,
              emotion: true,
              tags: true,
              source: true,
            },
          },
          clock: {
            select: {
              id: true,
              style: true,
            },
          },
          text: {
            select: {
              id: true,
              font_name: true,
            },
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
            include: { tag: true },
          },
          notes: {
            where: { is_deleted: false },
            select: {
              id: true,
              content: true,
              note_order: true,
              created_at: true,
              updated_at: true,
            },
            orderBy: { note_order: 'asc' },
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

      // Delete space tags (hard delete since no soft delete field)
      await tx.spaceTag.deleteMany({
        where: { space_id: id },
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
            include: {
              tag: true,
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

  async findDashboard() {
    return await prisma.space.findMany({
      where: {
        is_deleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        background: {
          select: {
            id: true,
            background_url: true,
            emotion: true,
            tags: true,
            source: true,
          },
        },
        clock: {
          select: {
            id: true,
            style: true,
          },
        },
        text: {
          select: {
            id: true,
            font_name: true,
          },
        },
        space_tags: {
          include: {
            tag: true,
          },
        },
        notes: {
          where: { is_deleted: false },
          select: {
            id: true,
            content: true,
            note_order: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: { note_order: 'asc' },
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
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 9,
    });
  },
};

export default spaceRepository;
