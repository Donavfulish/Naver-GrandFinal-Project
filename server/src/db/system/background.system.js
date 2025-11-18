import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const BG_DIR = path.join(process.cwd(), 'storage', 'background');

// Danh sách định dạng ảnh hợp lệ
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Một số emotion mẫu
const EMOTION_SAMPLES = [
  "Calm", "Happy", "Warm", "Dark", "Energetic",
  "Peaceful", "Moody", "Inspiring"
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

      const emotionCount = Math.floor(Math.random() * 3) + 1; // 1 → 3 emotion
      const emotion = Array.from({ length: emotionCount }, () => pickRandom(EMOTION_SAMPLES));

      const newBg = await prisma.background.create({
        data: {
          background_url: filePath,
          emotion,
          source: "SYSTEM",
          is_deleted: false,
        },
      });

      console.log(`Imported: ${file} -> ID: ${newBg.id}`);
    }

    console.log('\nHoàn tất import background!');
  } catch (error) {
    console.error('Lỗi khi import background:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllBackgrounds();
