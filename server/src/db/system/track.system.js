import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const TRACK_DIR = path.join(process.cwd(), 'storage', 'track');

// danh sách từ khóa cảm xúc đơn giản
const EMOTION_KEYWORDS = [
  'calm', 'relaxing', 'relax', 'soft', 'emotional',
  'happy', 'sad', 'dark', 'bright', 'chill', 'peaceful',
  'inspiring', 'inspiration', 'romantic', 'focus'
];

function capitalizeWords(str) {
  return str
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractWords(file) {
  return file
    .replace('.mp3', '')
    .split('-')
    .filter(Boolean)
    .map(w => w.toLowerCase());
}

async function importAllTracks() {
  try {
    const files = fs.readdirSync(TRACK_DIR);
    const mp3Files = files.filter(f => f.toLowerCase().endsWith('.mp3'));

    if (!mp3Files.length) {
      console.log('Không tìm thấy file MP3 nào trong folder:', TRACK_DIR);
      return;
    }

    console.log(`Tìm thấy ${mp3Files.length} file MP3. Bắt đầu import...`);

    for (const file of mp3Files) {
      const filePath = path.join(TRACK_DIR, file);
      const words = extractWords(file);

      // name đẹp
      const name = capitalizeWords(file.replace('.mp3', ''));

      // emotion = từ khớp keyword cảm xúc
      const emotion = words.filter(w => EMOTION_KEYWORDS.includes(w));

      // tags = toàn bộ từ
      const tags = words;

      console.log(`Import: ${file}`);

      await prisma.track.create({
        data: {
          name,
          track_url: filePath,
          emotion,
          tags,
          source: 'SYSTEM',
          is_deleted: false
        }
      });
    }

    console.log('Hoàn tất import!');
  } catch (error) {
    console.error('Lỗi khi import track:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllTracks();
