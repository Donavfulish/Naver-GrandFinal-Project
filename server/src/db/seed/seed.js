import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.spaceTag.deleteMany();
  await prisma.playlistTrack.deleteMany();
  await prisma.widgetPosition.deleteMany();
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

  // Query existing fonts (đã được import từ system files)
  const clockFonts = await prisma.clockFont.findMany({
    where: { is_deleted: false },
    take: 10,
  });

  const textFonts = await prisma.textFont.findMany({
    where: { is_deleted: false },
    take: 10,
  });

  if (clockFonts.length === 0 || textFonts.length === 0) {
    console.error('⚠️ Không tìm thấy fonts trong database!');
    console.error('Hãy chạy system files trước:');
    console.error('  node src/db/system/clockFont.system.js');
    console.error('  node src/db/system/textFont.system.js');
    throw new Error('Fonts not found in database');
  }

  console.log(`Found ${clockFonts.length} clock fonts and ${textFonts.length} text fonts`);

  // Query existing backgrounds (đã được import từ system file)
  const backgrounds = await prisma.background.findMany({
    where: { is_deleted: false },
    take: 5,
  });

  if (backgrounds.length === 0) {
    console.error('⚠️ Không tìm thấy backgrounds trong database!');
    console.error('Hãy chạy system file trước:');
    console.error('  node src/db/system/background.system.js');
    throw new Error('Backgrounds not found in database');
  }

  console.log(`Found ${backgrounds.length} backgrounds`);

  // Query existing tracks (đã được import từ system file)
  const tracks = await prisma.track.findMany({
    where: { is_deleted: false },
    take: 5,
  });

  if (tracks.length === 0) {
    console.error('⚠️ Không tìm thấy tracks trong database!');
    console.error('Hãy chạy system file trước:');
    console.error('  node src/db/system/track.system.js');
    throw new Error('Tracks not found in database');
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
  ]);

  console.log('Created tags');

  // Create 5 spaces for the user
  const spaces = [];

  // Space 1: Study Space
  const space1 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'My Study Space',
      description: 'Perfect space for focused studying and concentration',
      background_id: backgrounds[0].id,
      clock_font_id: clockFonts[0].id,
      text_font_id: textFonts[0].id,
      is_deleted: false,
    },
  });
  spaces.push(space1);

  // Space 2: Work Space
  const space2 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Professional Work Space',
      description: 'Organized workspace for maximum productivity',
      background_id: backgrounds[1] ? backgrounds[1].id : backgrounds[0].id,
      clock_font_id: clockFonts[1] ? clockFonts[1].id : clockFonts[0].id,
      text_font_id: textFonts[1] ? textFonts[1].id : textFonts[0].id,
      is_deleted: false,
    },
  });
  spaces.push(space2);

  // Space 3: Relaxation Space
  const space3 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Chill & Relax',
      description: 'Peaceful space for meditation and relaxation',
      background_id: backgrounds[2] ? backgrounds[2].id : backgrounds[0].id,
      clock_font_id: clockFonts[2] ? clockFonts[2].id : clockFonts[0].id,
      text_font_id: textFonts[2] ? textFonts[2].id : textFonts[0].id,
      is_deleted: false,
    },
  });
  spaces.push(space3);

  // Space 4: Creative Space
  const space4 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Creative Studio',
      description: 'Inspiring space for creative work and brainstorming',
      background_id: backgrounds[3] ? backgrounds[3].id : backgrounds[0].id,
      clock_font_id: clockFonts[3] ? clockFonts[3].id : clockFonts[0].id,
      text_font_id: textFonts[3] ? textFonts[3].id : textFonts[0].id,
      is_deleted: false,
    },
  });
  spaces.push(space4);

  // Space 5: Beach Vibes
  const space5 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Beach Vibes',
      description: 'Tropical paradise for a peaceful work environment',
      background_id: backgrounds[4] ? backgrounds[4].id : backgrounds[0].id,
      clock_font_id: clockFonts[4] ? clockFonts[4].id : clockFonts[0].id,
      text_font_id: textFonts[4] ? textFonts[4].id : textFonts[0].id,
      is_deleted: false,
    },
  });
  spaces.push(space5);

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
      { space_id: space4.id, tag_id: tags[6].id }, // creative
      { space_id: space4.id, tag_id: tags[3].id }, // work
      { space_id: space5.id, tag_id: tags[1].id }, // relaxation
    ],
  });

  console.log('Added tags to spaces');

  // Create playlists for each space
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

  // Add tracks to playlists (sử dụng tracks đã có trong system)
  await prisma.playlistTrack.createMany({
    data: [
      // Playlist 1 (Study) - sử dụng track có sẵn
      { playlist_id: playlist1.id, track_id: tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist1.id, track_id: tracks[1] ? tracks[1].id : tracks[0].id, track_order: 2, is_deleted: false },

      // Playlist 2 (Work)
      { playlist_id: playlist2.id, track_id: tracks[2] ? tracks[2].id : tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist2.id, track_id: tracks[3] ? tracks[3].id : tracks[0].id, track_order: 2, is_deleted: false },

      // Playlist 3 (Relaxation)
      { playlist_id: playlist3.id, track_id: tracks[1] ? tracks[1].id : tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist3.id, track_id: tracks[0].id, track_order: 2, is_deleted: false },

      // Playlist 4 (Creative)
      { playlist_id: playlist4.id, track_id: tracks[3] ? tracks[3].id : tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist4.id, track_id: tracks[2] ? tracks[2].id : tracks[0].id, track_order: 2, is_deleted: false },

      // Playlist 5 (Beach)
      { playlist_id: playlist5.id, track_id: tracks[4] ? tracks[4].id : tracks[0].id, track_order: 1, is_deleted: false },
      { playlist_id: playlist5.id, track_id: tracks[1] ? tracks[1].id : tracks[0].id, track_order: 2, is_deleted: false },
    ],
  });

  console.log('Added tracks to playlists');

  // Create widget positions for spaces
  await prisma.widgetPosition.createMany({
    data: [
      {
        space_id: space1.id,
        position: { x: 100, y: 100, width: 300, height: 200, type: 'clock' },
        is_deleted: false,
      },
      {
        space_id: space1.id,
        position: { x: 500, y: 100, width: 400, height: 300, type: 'playlist' },
        is_deleted: false,
      },
      {
        space_id: space2.id,
        position: { x: 150, y: 150, width: 350, height: 250, type: 'clock' },
        is_deleted: false,
      },
      {
        space_id: space3.id,
        position: { x: 200, y: 200, width: 300, height: 200, type: 'notes' },
        is_deleted: false,
      },
      {
        space_id: space4.id,
        position: { x: 100, y: 300, width: 400, height: 250, type: 'playlist' },
        is_deleted: false,
      },
      {
        space_id: space5.id,
        position: { x: 250, y: 150, width: 300, height: 200, type: 'clock' },
        is_deleted: false,
      },
    ],
  });

  console.log('Created widget positions');

  // Create notes for spaces
  await prisma.note.createMany({
    data: [
      // Notes for Space 1 (Study)
      {
        space_id: space1.id,
        content: 'Review chapter 5 for exam',
        note_order: 1,
        is_delete: false,
      },
      {
        space_id: space1.id,
        content: 'Complete assignment due Friday',
        note_order: 2,
        is_delete: false,
      },
      {
        space_id: space1.id,
        content: 'Study group meeting at 3pm',
        note_order: 3,
        is_delete: false,
      },
      // Notes for Space 2 (Work)
      {
        space_id: space2.id,
        content: 'Prepare presentation for client meeting',
        note_order: 1,
        is_delete: false,
      },
      {
        space_id: space2.id,
        content: 'Review quarterly reports',
        note_order: 2,
        is_delete: false,
      },
      // Notes for Space 3 (Relaxation)
      {
        space_id: space3.id,
        content: 'Practice mindfulness meditation',
        note_order: 1,
        is_delete: false,
      },
      {
        space_id: space3.id,
        content: 'Deep breathing exercises',
        note_order: 2,
        is_delete: false,
      },
      // Notes for Space 4 (Creative)
      {
        space_id: space4.id,
        content: 'Brainstorm ideas for new project',
        note_order: 1,
        is_delete: false,
      },
      {
        space_id: space4.id,
        content: 'Sketch initial designs',
        note_order: 2,
        is_delete: false,
      },
      {
        space_id: space4.id,
        content: 'Research color palettes',
        note_order: 3,
        is_delete: false,
      },
      // Notes for Space 5 (Beach)
      {
        space_id: space5.id,
        content: 'Read a good book',
        note_order: 1,
        is_delete: false,
      },
      {
        space_id: space5.id,
        content: 'Listen to ocean sounds',
        note_order: 2,
        is_delete: false,
      },
    ],
  });

  console.log('Created notes');

  console.log('\n=== Seed completed successfully! ===');
  console.log(`User created: ${user.email} (password: password123)`);
  console.log(`Spaces created: ${spaces.length}`);
  spaces.forEach((space, index) => {
    console.log(`  ${index + 1}. ${space.name}`);
  });
  console.log(`Using ${backgrounds.length} backgrounds from system`);
  console.log(`Using ${tracks.length} tracks from system`);
  console.log(`Tags: ${tags.length}`);
  console.log(`Fonts: ${clockFonts.length} clock fonts, ${textFonts.length} text fonts from system`);
  console.log(`Notes: 12 notes created across all spaces`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
