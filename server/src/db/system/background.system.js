import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { EMOTION_KEYWORDS, TAG_KEYWORDS } from '../../constants/state.js';

const prisma = new PrismaClient();
const BG_DIR = path.join(process.cwd(), 'storage', 'background');

// Danh sách định dạng ảnh hợp lệ
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function importAllBackgrounds() {
  try {
    const files = fs.readdirSync(BG_DIR);
    const imageFiles = files.filter(f =>
      IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())
    );

    if (!imageFiles.length) {
      console.log('Không tìm thấy file ảnh nào trong folder:', BG_DIR);
      return;
    }

    console.log(`Tìm thấy ${imageFiles.length} ảnh. Bắt đầu import...\n`);

    for (const file of imageFiles) {
      const filePath = path.join(BG_DIR, file);

      // Random 2-4 emotions từ EMOTION_KEYWORDS
      const emotionCount = getRandomInt(2, 4);
      const emotion = pickRandom(EMOTION_KEYWORDS, emotionCount);

      // Random 3-6 tags từ TAG_KEYWORDS
      const tagCount = getRandomInt(3, 6);
      const tags = pickRandom(TAG_KEYWORDS, tagCount);

      const newBg = await prisma.background.create({
        data: {
          background_url: filePath,
          emotion,
          tags,
          source: "SYSTEM",
          is_deleted: false,
        },
      });

      console.log(`Imported: ${file} -> ID: ${newBg.id}`);
      console.log(`  Emotions: ${emotion.join(', ')}`);
      console.log(`  Tags: ${tags.join(', ')}\n`);
    }

    console.log('\nHoàn tất import background!');
  } catch (error) {
    console.error('Lỗi khi import background:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllBackgrounds();
