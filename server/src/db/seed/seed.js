import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { MOOD_KEYWORDS } from '../../constants/state.js';

const prisma = new PrismaClient();

// Helper to pick a mood from MOOD_KEYWORDS with case-insensitive matching
function findMood(preferred) {
  if (!Array.isArray(MOOD_KEYWORDS) || MOOD_KEYWORDS.length === 0) return preferred;
  const target = String(preferred || '').toLowerCase();
  const exact = MOOD_KEYWORDS.find(m => String(m).toLowerCase() === target);
  if (exact) return exact;
  const partial = MOOD_KEYWORDS.find(m =>
    String(m).toLowerCase().includes(target) || target.includes(String(m).toLowerCase())
  );
  return partial ?? MOOD_KEYWORDS[0];
}

// Helper to generate random personalityEssence
function generatePersonalityEssence(dominantMood) {
  const essences = {
    'Exhausted': { 'Exhausted': 8, 'Anxious': 5, 'Neutral': 3 },
    'Frustrated': { 'Frustrated': 8, 'Anxious': 6, 'Neutral': 3 },
    'Anxious': { 'Anxious': 8, 'Frustrated': 4, 'Neutral': 5 },
    'Neutral': { 'Neutral': 7, 'Content': 5, 'Happy': 3 },
    'Content': { 'Content': 8, 'Happy': 6, 'Neutral': 4 },
    'Happy': { 'Happy': 9, 'Content': 6, 'Joyful': 5 },
    'Inspired': { 'Inspired': 9, 'Happy': 7, 'Joyful': 6 },
    'Joyful': { 'Joyful': 10, 'Happy': 8, 'Inspired': 7 }
  };

  return essences[dominantMood] || essences['Neutral'];
}

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
  const passwordHash = await bcrypt.hash('123', 10);
  const user = await prisma.user.create({
    data: {
      id: "c576b64d-5eb8-44d6-b1f2-18591c49cba4",
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: passwordHash,
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      mind: "Bạn là người mới hãy bắt đầu hành trình khám phá bản thân",
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
    take: 10,
  });

  if (backgrounds.length === 0) {
    console.error('⚠️ Missing backgrounds in DB!');
    throw new Error('Backgrounds not found. Please run background seeder first.');
  }

  console.log(`Found ${backgrounds.length} backgrounds`);

  // Query tracks
  const tracks = await prisma.track.findMany({
    where: { is_deleted: false },
    take: 10,
  });

  if (tracks.length === 0) {
    console.error('⚠️ Missing tracks in DB!');
    throw new Error('Tracks not found. Please run track seeder first.');
  }

  console.log(`Found ${tracks.length} tracks`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'productivity', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'relaxation', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'study', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'work', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'meditation', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'focus', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'creative', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'chill', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'peaceful', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'energetic', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'ambient', is_deleted: false } }),
    prisma.tag.create({ data: { name: 'nature', is_deleted: false } }),
  ]);

  console.log('Created tags');

  // Create 10 spaces with different themes and complete data
  const spaces = [];

  const space1 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'My Study Space',
      description: 'Perfect space for focused studying and concentration',
      mood: findMood('Content'),
      personalityEssence: generatePersonalityEssence('Content'),
      background_id: backgrounds[0].id,
      clock_font_id: clockFonts[0].id,
      text_font_id: textFonts[0].id,
      duration: 3600,
      is_deleted: false,
    },
  });

  const space2 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Professional Work Space',
      description: 'Organized workspace for maximum productivity',
      mood: findMood('Inspired'),
      personalityEssence: generatePersonalityEssence('Inspired'),
      background_id: backgrounds[1]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[1]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[1]?.id ?? textFonts[0].id,
      duration: 7200,
      is_deleted: false,
    },
  });

  const space3 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Chill & Relax',
      description: 'Peaceful space for meditation and relaxation',
      mood: findMood('Content'),
      personalityEssence: generatePersonalityEssence('Content'),
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
      mood: findMood('Happy'),
      personalityEssence: generatePersonalityEssence('Happy'),
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
      mood: findMood('Joyful'),
      personalityEssence: generatePersonalityEssence('Joyful'),
      background_id: backgrounds[4]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[4]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[4]?.id ?? textFonts[0].id,
      duration: 7200,
      is_deleted: false,
    },
  });

  const space6 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Morning Motivation',
      description: 'Start your day with energy and positivity',
      mood: findMood('Inspired'),
      personalityEssence: generatePersonalityEssence('Inspired'),
      background_id: backgrounds[5]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[5]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[5]?.id ?? textFonts[0].id,
      duration: 2700,
      is_deleted: false,
    },
  });

  const space7 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Late Night Coding',
      description: 'Perfect environment for deep work and coding sessions',
      mood: findMood('Neutral'),
      personalityEssence: generatePersonalityEssence('Neutral'),
      background_id: backgrounds[6]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[6]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[6]?.id ?? textFonts[0].id,
      duration: 9000,
      is_deleted: false,
    },
  });

  const space8 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Zen Garden',
      description: 'Find your inner peace in this tranquil space',
      mood: findMood('Content'),
      personalityEssence: generatePersonalityEssence('Content'),
      background_id: backgrounds[7]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[7]?.id ?? clockFonts[0].id,
      text_font_id: textFonts[7]?.id ?? textFonts[0].id,
      duration: 3000,
      is_deleted: false,
    },
  });

  const space9 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Power Hour',
      description: 'High-energy space for maximum productivity',
      mood: findMood('Inspired'),
      personalityEssence: generatePersonalityEssence('Inspired'),
      background_id: backgrounds[8]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[0].id,
      text_font_id: textFonts[0].id,
      duration: 3600,
      is_deleted: false,
    },
  });

  const space10 = await prisma.space.create({
    data: {
      user_id: user.id,
      name: 'Reading Corner',
      description: 'Cozy space for immersive reading sessions',
      mood: findMood('Happy'),
      personalityEssence: generatePersonalityEssence('Happy'),
      background_id: backgrounds[9]?.id ?? backgrounds[0].id,
      clock_font_id: clockFonts[1].id,
      text_font_id: textFonts[1].id,
      duration: 4500,
      is_deleted: false,
    },
  });

  spaces.push(space1, space2, space3, space4, space5, space6, space7, space8, space9, space10);

  console.log('Created 10 spaces');

  // Add tags to spaces
  await prisma.spaceTag.createMany({
    data: [
      // Space 1 - Study
      { space_id: space1.id, tag_id: tags[2].id, is_deleted: false }, // study
      { space_id: space1.id, tag_id: tags[5].id, is_deleted: false }, // focus

      // Space 2 - Work
      { space_id: space2.id, tag_id: tags[0].id, is_deleted: false }, // productivity
      { space_id: space2.id, tag_id: tags[3].id, is_deleted: false }, // work

      // Space 3 - Relax
      { space_id: space3.id, tag_id: tags[1].id, is_deleted: false }, // relaxation
      { space_id: space3.id, tag_id: tags[4].id, is_deleted: false }, // meditation
      { space_id: space3.id, tag_id: tags[7].id, is_deleted: false }, // chill

      // Space 4 - Creative
      { space_id: space4.id, tag_id: tags[6].id, is_deleted: false }, // creative
      { space_id: space4.id, tag_id: tags[3].id, is_deleted: false }, // work

      // Space 5 - Beach
      { space_id: space5.id, tag_id: tags[1].id, is_deleted: false }, // relaxation
      { space_id: space5.id, tag_id: tags[8].id, is_deleted: false }, // peaceful
      { space_id: space5.id, tag_id: tags[11].id, is_deleted: false }, // nature

      // Space 6 - Morning
      { space_id: space6.id, tag_id: tags[9].id, is_deleted: false }, // energetic
      { space_id: space6.id, tag_id: tags[0].id, is_deleted: false }, // productivity

      // Space 7 - Coding
      { space_id: space7.id, tag_id: tags[5].id, is_deleted: false }, // focus
      { space_id: space7.id, tag_id: tags[3].id, is_deleted: false }, // work
      { space_id: space7.id, tag_id: tags[10].id, is_deleted: false }, // ambient

      // Space 8 - Zen
      { space_id: space8.id, tag_id: tags[4].id, is_deleted: false }, // meditation
      { space_id: space8.id, tag_id: tags[8].id, is_deleted: false }, // peaceful
      { space_id: space8.id, tag_id: tags[11].id, is_deleted: false }, // nature

      // Space 9 - Power Hour
      { space_id: space9.id, tag_id: tags[0].id, is_deleted: false }, // productivity
      { space_id: space9.id, tag_id: tags[9].id, is_deleted: false }, // energetic

      // Space 10 - Reading
      { space_id: space10.id, tag_id: tags[5].id, is_deleted: false }, // focus
      { space_id: space10.id, tag_id: tags[1].id, is_deleted: false }, // relaxation
    ],
  });

  console.log('Added tags to spaces');

  // Create playlists for all spaces
  const playlists = [];

  for (let i = 0; i < spaces.length; i++) {
    const playlist = await prisma.playlist.create({
      data: {
        space_id: spaces[i].id,
        name: `${spaces[i].name} - Playlist`,
        is_deleted: false,
      },
    });
    playlists.push(playlist);
  }

  console.log('Created playlists');

  // Add tracks to playlists
  const playlistTracksData = [];

  for (let i = 0; i < playlists.length; i++) {
    // Add 2-3 tracks to each playlist
    const trackCount = Math.min(3, tracks.length);
    for (let j = 0; j < trackCount; j++) {
      const trackIndex = (i + j) % tracks.length;
      playlistTracksData.push({
        playlist_id: playlists[i].id,
        track_id: tracks[trackIndex].id,
        track_order: j + 1,
        is_deleted: false
      });
    }
  }

  await prisma.playlistTrack.createMany({ data: playlistTracksData });

  console.log('Added tracks to playlists');

  // Create notes for spaces
  await prisma.note.createMany({
    data: [
      // Space 1 notes
      { space_id: space1.id, content: 'Review chapter 5 for exam', note_order: 0, is_deleted: false },
      { space_id: space1.id, content: 'Complete assignment due Friday', note_order: 1, is_deleted: false },
      { space_id: space1.id, content: 'Study group meeting at 3pm', note_order: 2, is_deleted: false },

      // Space 2 notes
      { space_id: space2.id, content: 'Prepare presentation for meeting', note_order: 0, is_deleted: false },
      { space_id: space2.id, content: 'Review quarterly reports', note_order: 1, is_deleted: false },
      { space_id: space2.id, content: 'Schedule team standup', note_order: 2, is_deleted: false },

      // Space 3 notes
      { space_id: space3.id, content: 'Practice meditation for 20 minutes', note_order: 0, is_deleted: false },
      { space_id: space3.id, content: 'Deep breathing exercises', note_order: 1, is_deleted: false },

      // Space 4 notes
      { space_id: space4.id, content: 'Brainstorm project ideas', note_order: 0, is_deleted: false },
      { space_id: space4.id, content: 'Sketch design concepts', note_order: 1, is_deleted: false },
      { space_id: space4.id, content: 'Research color palettes', note_order: 2, is_deleted: false },

      // Space 5 notes
      { space_id: space5.id, content: 'Read a good book', note_order: 0, is_deleted: false },
      { space_id: space5.id, content: 'Listen to ocean sounds', note_order: 1, is_deleted: false },

      // Space 6 notes
      { space_id: space6.id, content: 'Morning workout routine', note_order: 0, is_deleted: false },
      { space_id: space6.id, content: 'Plan the day ahead', note_order: 1, is_deleted: false },

      // Space 7 notes
      { space_id: space7.id, content: 'Debug authentication module', note_order: 0, is_deleted: false },
      { space_id: space7.id, content: 'Implement new API endpoints', note_order: 1, is_deleted: false },
      { space_id: space7.id, content: 'Write unit tests', note_order: 2, is_deleted: false },

      // Space 8 notes
      { space_id: space8.id, content: 'Practice mindfulness', note_order: 0, is_deleted: false },
      { space_id: space8.id, content: 'Reflect on the day', note_order: 1, is_deleted: false },

      // Space 9 notes
      { space_id: space9.id, content: 'Focus on priority tasks', note_order: 0, is_deleted: false },
      { space_id: space9.id, content: 'Complete urgent deliverables', note_order: 1, is_deleted: false },

      // Space 10 notes
      { space_id: space10.id, content: 'Finish reading current chapter', note_order: 0, is_deleted: false },
      { space_id: space10.id, content: 'Take notes on key insights', note_order: 1, is_deleted: false },
    ],
  });

  console.log('Created notes');

  // Create AI Generated Content for spaces
  await prisma.aiGeneratedContent.createMany({
    data: [
      {
        space_id: space1.id,
        prompt: 'I need a study space for focused learning',
        content: 'A dedicated study environment can significantly improve concentration and retention. Consider using the Pomodoro technique to maintain focus.',
      },
      {
        space_id: space2.id,
        prompt: 'Professional workspace for productivity',
        content: 'An organized workspace enhances productivity and reduces stress. Keep your desk clean and prioritize tasks effectively.',
      },
      {
        space_id: space3.id,
        prompt: 'Relaxing meditation space',
        content: 'Creating a peaceful meditation space helps reduce anxiety and improve mental clarity. Regular practice can transform your daily life.',
      },
      {
        space_id: space4.id,
        prompt: 'Creative studio for brainstorming',
        content: 'A creative environment stimulates innovation and fresh ideas. Surround yourself with inspirational elements.',
      },
      {
        space_id: space5.id,
        prompt: 'Beach-themed relaxation space',
        content: 'Nature-inspired spaces can reduce stress and improve mood. The calming effect of ocean imagery promotes relaxation.',
      },
      {
        space_id: space6.id,
        prompt: 'Morning motivation space',
        content: 'Starting your day in an energizing environment sets a positive tone. Morning rituals are key to success.',
      },
      {
        space_id: space7.id,
        prompt: 'Late night coding environment',
        content: 'Deep work requires minimal distractions. A dedicated coding space helps maintain flow state during intense sessions.',
      },
      {
        space_id: space8.id,
        prompt: 'Zen garden meditation space',
        content: 'Zen principles teach us to find peace in simplicity. Create a space that embodies calm and tranquility.',
      },
      {
        space_id: space9.id,
        prompt: 'Power hour for maximum productivity',
        content: 'High-intensity work sessions require mental preparation and focus. Break down your tasks into manageable chunks and tackle them with full energy.',
      },
      {
        space_id: space10.id,
        prompt: 'Cozy reading corner',
        content: 'Reading enriches the mind and expands perspectives. Create a comfortable environment where you can immerse yourself in stories and knowledge.',
      },
    ],
  });

  console.log('Created AI generated content');

  console.log('\n=== Seed completed successfully! ===');
  console.log(`User created: ${user.email} (password: 123)`);
  console.log(`Spaces created: ${spaces.length}`);
  console.log(`Tags created: ${tags.length}`);
  console.log(`Playlists created: ${playlists.length}`);
  console.log(`Notes created: 20+`);
  console.log(`AI Content created: 10`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
