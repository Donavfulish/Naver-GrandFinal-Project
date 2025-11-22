import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';
import { EMOTION_KEYWORDS, TAG_KEYWORDS } from '../../constants/state.js';

const prisma = new PrismaClient();
const TRACK_DIR = path.join(process.cwd(), 'storage', 'track');

function capitalizeWords(str) {
  return str
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractWords(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\.mp3$/, '')
    .split('-')
    .filter(Boolean);
}

function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Lấy thumbnail embedded trong metadata của MP3
async function extractEmbeddedThumbnail(mp3File) {
  try {
    const fullPath = path.join(TRACK_DIR, mp3File);
    const metadata = await mm.parseFile(fullPath);

    const picture = metadata.common.picture?.[0];
    if (!picture) return null;

    const ext = picture.format.includes('png') ? '.png' : '.jpg';
    const outputFilename = mp3File.replace(/\.mp3$/i, ext);
    const outputPath = path.join(TRACK_DIR, outputFilename);

    fs.writeFileSync(outputPath, picture.data);

    return `track/${outputFilename}`; // relative path cho DB
  } catch (err) {
    console.error('Lỗi đọc metadata MP3:', err);
    return null;
  }
}

async function importAllTracks() {
  try {
    const files = fs.readdirSync(TRACK_DIR);
    const mp3Files = files.filter(f => f.toLowerCase().endsWith('.mp3'));

    if (mp3Files.length === 0) {
      console.log('Không tìm thấy file MP3 nào.');
      return;
    }

    console.log(`Tìm thấy ${mp3Files.length} file MP3. Bắt đầu import...\n`);

    for (const file of mp3Files) {
      const words = extractWords(file);
      const name = capitalizeWords(path.parse(file).name);

      const thumbnail = await extractEmbeddedThumbnail(file);

      const extractedEmotions = words.filter(w => EMOTION_KEYWORDS.includes(w));
      const emotionCount = Math.max(2, extractedEmotions.length);
      const randomEmotions = pickRandom(
        EMOTION_KEYWORDS.filter(e => !extractedEmotions.includes(e)),
        Math.max(0, emotionCount - extractedEmotions.length)
      );
      const emotion = [...new Set([...extractedEmotions, ...randomEmotions])];

      const extractedTags = words.filter(w => TAG_KEYWORDS.includes(w));
      const tagCount = Math.max(3, extractedTags.length);
      const randomTags = pickRandom(
        TAG_KEYWORDS.filter(t => !extractedTags.includes(t)),
        Math.max(0, tagCount - extractedTags.length)
      );
      const tags = [...new Set([...extractedTags, ...randomTags])];

      console.log(`Import: ${file} → ${thumbnail ?? 'no thumbnail in metadata'}`);
      console.log(`  Emotions: ${emotion.join(', ')}`);
      console.log(`  Tags: ${tags.join(', ')}\n`);

      // Lưu vào DB
      await prisma.track.create({
        data: {
          name,
          thumbnail: thumbnail ?? "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
          track_url: `storage/track/${file}`, // relative path
          emotion,
          tags,
          source: 'SYSTEM',
          is_deleted: false
        }
      });
    }

    console.log('\nHoàn tất import!');
  } catch (error) {
    console.error('Lỗi khi import track:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllTracks();
