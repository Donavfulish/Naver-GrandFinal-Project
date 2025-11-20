import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.aiGeneratedContent.deleteMany();
  await prisma.spaceTag.deleteMany();
  await prisma.playlistTrack.deleteMany();
  await prisma.note.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: passwordHash,
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      is_deleted: false,
    },
  });

  console.log('Created user:', user.email);

  // Query existing fonts (from system)
  const clockFonts = await prisma.clockFont.findMany({
    where: { is_deleted: false },
    take: 10,
  });

  const textFonts = await prisma.textFont.findMany({
    where: { is_deleted: false },
    take: 10,
  });

  if (clockFonts.length === 0 || textFonts.length === 0) {
    console.error('⚠️ Missing fonts in DB!');
    throw new Error('Fonts not found. Please run font seeder first.');
  }

  console.log(`Found ${clockFonts.length} clock fonts and ${textFonts.length} text fonts`);

  // Query backgrounds
  const backgrounds = await prisma.background.findMany({
    where: { is_deleted: false },
    take: 5,
  });

  if (backgrounds.length === 0) {
    console.error('⚠️ Missing backgrounds in DB!');
    throw new Error('Backgrounds not found. Please run background seeder first.');
  }

  console.log(`Found ${backgrounds.length} backgrounds`);

  // Query tracks
  const tracks = await prisma.track.findMany({
    where: { is_deleted: false },
    take: 5,
  });

  if (tracks.length === 0) {
    console.error('⚠️ Missing tracks in DB!');
    throw new Error('Tracks not found. Please run track seeder first.');
  }

  console.log(`Found ${tracks.length} tracks`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'productivity' } }),
    prisma.tag.create({ data: { name: 'relaxation' } }),
    prisma.tag.create({ data: { name: 'study' } }),
    prisma.tag.create({ data: { name: 'work' } }),
    prisma.tag.create({ data: { name: 'meditation' } }),
    prisma.tag.create({ data: { name: 'focus' } }),
    prisma.tag.create({ data: { name: 'creative' } }),
    prisma.tag.create({ data: { name: 'chill' } }),
    prisma.tag.create({ data: { name: 'peaceful' } }),
  ]);

  console.log('Created tags');

  // Create 5 spaces with different themes
  const spaces = [];

  const space1 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'My Study Space',
      description: 'Perfect space for focused studying and concentration',
      mood: 'Focused',
      background_id: backgrounds[0].id,
      clock_font_id: clockFonts[0].id,
      text_font_id: textFonts[0].id,
      duration: 0,
      is_deleted: false,
    },
  });

  const space2 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Professional Work Space',
      description: 'Organized workspace for maximum productivity',
      mood: 'Productive',
      background_id: backgrounds[1]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[1]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[1]?.id ?? textFonts[0].id,
      duration: 3600,
      is_deleted: false,
    },
  });

  const space3 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Chill & Relax',
      description: 'Peaceful space for meditation and relaxation',
      mood: 'Peaceful',
      background_id: backgrounds[2]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[2]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[2]?.id ?? textFonts[0].id,
      duration: 1800,
      is_deleted: false,
    },
  });

  const space4 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Creative Studio',
      description: 'Inspiring space for creative work and brainstorming',
      mood: 'Inspired',
      background_id: backgrounds[3]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[3]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[3]?.id ?? textFonts[0].id,
      duration: 5400,
      is_deleted: false,
    },
  });

  const space5 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Beach Vibes',
      description: 'Tropical paradise for a peaceful work environment',
      mood: 'Relaxed',
      background_id: backgrounds[4]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[4]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[4]?.id ?? textFonts[0].id,
      duration: 7200,
      is_deleted: false,
    },
  });

  spaces.push(space1, space2, space3, space4, space5);

  console.log('Created 5 spaces');

  // Add tags to spaces
  await prisma.spaceTag.createMany({
    data: [
      { space_id: space1.id, tag_id: tags[2].id }, // study
      { space_id: space1.id, tag_id: tags[5].id }, // focus
      { space_id: space2.id, tag_id: tags[0].id }, // productivity
      { space_id: space2.id, tag_id: tags[3].id }, // work
      { space_id: space3.id, tag_id: tags[1].id }, // relaxation
      { space_id: space3.id, tag_id: tags[4].id }, // meditation
      { space_id: space3.id, tag_id: tags[7].id }, // chill
      { space_id: space4.id, tag_id: tags[6].id }, // creative
      { space_id: space4.id, tag_id: tags[3].id }, // work
      { space_id: space5.id, tag_id: tags[1].id }, // relaxation
      { space_id: space5.id, tag_id: tags[8].id }, // peaceful
    ],
  });

  console.log('Added tags to spaces');

  // Create playlists
  const playlist1 = await prisma.playlist.create({
    data: {
      space_id: space1.id,
      name: 'Study Focus Mix',
      is_deleted: false,
    },
  });

  const playlist2 = await prisma.playlist.create({
    data: {
      space_id: space2.id,
      name: 'Work Productivity',
      is_deleted: false,
    },
  });

  const playlist3 = await prisma.playlist.create({
    data: {
      space_id: space3.id,
      name: 'Meditation & Calm',
      is_deleted: false,
    },
  });

  const playlist4 = await prisma.playlist.create({
    data: {
      space_id: space4.id,
      name: 'Creative Flow',
      is_deleted: false,
    },
  });

  const playlist5 = await prisma.playlist.create({
    data: {
      space_id: space5.id,
      name: 'Beach Tunes',
      is_deleted: false,
    },
  });

  console.log('Created playlists');

  // Add tracks to playlists
  await prisma.playlistTrack.createMany({
    data: [
      { playlist_id: playlist1.id, track_id: tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist1.id, track_id: tracks[1]?.id ?? tracks[0].id, track_order: 2, is_deleted: false },

      { playlist_id: playlist2.id, track_id: tracks[2]?.id ?? tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist2.id, track_id: tracks[3]?.id ?? tracks[0].id, track_order: 2, is_deleted: false },

      { playlist_id: playlist3.id, track_id: tracks[1]?.id ?? tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist3.id, track_id: tracks[0].id, track_order: 2, is_deleted: false },

      { playlist_id: playlist4.id, track_id: tracks[3]?.id ?? tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist4.id, track_id: tracks[2]?.id ?? tracks[0].id, track_order: 2, is_deleted: false },

      { playlist_id: playlist5.id, track_id: tracks[4]?.id ?? tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist5.id, track_id: tracks[1]?.id ?? tracks[0].id, track_order: 2, is_deleted: false },
    ],
  });

  console.log('Added tracks to playlists');

  // Create notes (using is_delete not is_deleted)
  await prisma.note.createMany({
    data: [
      { space_id: space1.id, content: 'Review chapter 5 for exam', note_order: 1, is_delete: false },
      { space_id: space1.id, content: 'Complete assignment due Friday', note_order: 2, is_delete: false },
      { space_id: space1.id, content: 'Study group meeting at 3pm', note_order: 3, is_delete: false },

      { space_id: space2.id, content: 'Prepare presentation for meeting', note_order: 1, is_delete: false },
      { space_id: space2.id, content: 'Review quarterly reports', note_order: 2, is_delete: false },
      { space_id: space2.id, content: 'Schedule team standup', note_order: 3, is_delete: false },

      { space_id: space3.id, content: 'Practice meditation for 20 minutes', note_order: 1, is_delete: false },
      { space_id: space3.id, content: 'Deep breathing exercises', note_order: 2, is_delete: false },

      { space_id: space4.id, content: 'Brainstorm project ideas', note_order: 1, is_delete: false },
      { space_id: space4.id, content: 'Sketch design concepts', note_order: 2, is_delete: false },
      { space_id: space4.id, content: 'Research color palettes', note_order: 3, is_delete: false },

      { space_id: space5.id, content: 'Read a good book', note_order: 1, is_delete: false },
      { space_id: space5.id, content: 'Listen to ocean sounds', note_order: 2, is_delete: false },
    ],
  });

  console.log('Created notes');

  // Create AI Generated Content for some spaces
  await prisma.aiGeneratedContent.createMany({
    data: [
      {
        space_id: space1.id,
        prompt: 'I need a study space for focused learning',
        mood: 'Content',
        content: JSON.stringify({
          tags: ['study', 'focus'],
          purpose: 'focused studying'
        }),
      },
      {
        space_id: space2.id,
        prompt: 'Professional workspace for productivity',
        mood: 'Inspired',
        content: JSON.stringify({
          tags: ['productivity', 'work'],
          purpose: 'professional work'
        }),
      },
      {
        space_id: space3.id,
        prompt: 'Relaxing meditation space',
        mood: 'Content',
        content: JSON.stringify({
          tags: ['relaxation', 'meditation'],
          purpose: 'meditation and relaxation'
        }),
      },
    ],
  });

  console.log('Created AI generated content');

  console.log('\n=== Seed completed successfully! ===');
  console.log(`User created: ${user.email} (password: password123)`);
  console.log(`Spaces created: ${spaces.length}`);
  console.log(`Tags created: ${tags.length}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
