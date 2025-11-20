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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Lấy thumbnail embedded trong metadata của MP3
async function extractEmbeddedThumbnail(mp3File) {
  try {
    const fullPath = path.join(TRACK_DIR, mp3File);
    const metadata = await mm.parseFile(fullPath);

    const picture = metadata.common.picture?.[0];
    if (!picture) return null; // ❌ không có thumbnail trong MP3

    const ext = picture.format.includes('png') ? '.png' : '.jpg';
    const outputFilename = mp3File.replace(/\.mp3$/i, ext);
    const outputPath = path.join(TRACK_DIR, outputFilename);

    fs.writeFileSync(outputPath, picture.data);

    return outputFilename; // trả về tên file thumbnail
  } catch (err) {
    console.error('Lỗi đọc metadata MP3:', err);
    return null;
  }
}

// Import track
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

      // CHỈ ĐỌC METADATA – KHÔNG tìm ảnh rời
      const thumbnail = await extractEmbeddedThumbnail(file);

      // Lấy emotion từ filename nếu có trong EMOTION_KEYWORDS
      const extractedEmotions = words.filter(w => EMOTION_KEYWORDS.includes(w));

      // Nếu không đủ emotion từ filename, random thêm để đảm bảo có ít nhất 2-3 emotions
      const emotionCount = Math.max(2, extractedEmotions.length);
      const randomEmotions = pickRandom(
        EMOTION_KEYWORDS.filter(e => !extractedEmotions.includes(e)),
        Math.max(0, emotionCount - extractedEmotions.length)
      );
      const emotion = [...new Set([...extractedEmotions, ...randomEmotions])];

      // Lấy tags từ filename nếu có trong TAG_KEYWORDS
      const extractedTags = words.filter(w => TAG_KEYWORDS.includes(w));

      // Nếu không đủ tags từ filename, random thêm để đảm bảo có ít nhất 3-5 tags
      const tagCount = Math.max(3, extractedTags.length);
      const randomTags = pickRandom(
        TAG_KEYWORDS.filter(t => !extractedTags.includes(t)),
        Math.max(0, tagCount - extractedTags.length)
      );
      const tags = [...new Set([...extractedTags, ...randomTags])];

      console.log(`Import: ${file} → ${thumbnail ? `embedded thumbnail: ${thumbnail}` : 'no thumbnail in metadata'}`);
      console.log(`  Emotions: ${emotion.join(', ')}`);
      console.log(`  Tags: ${tags.join(', ')}\n`);

      await prisma.track.create({
        data: {
          name,
          thumbnail: thumbnail ? `track/${thumbnail}` : "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
          track_url: path.join(TRACK_DIR, file),
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