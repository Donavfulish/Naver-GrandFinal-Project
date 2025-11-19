import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { EMOTION_KEYWORDS, TAG_KEYWORDS } from '../../constants/state.js';

const prisma = new PrismaClient();

// Danh sách URL ảnh từ Unsplash
const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'https://images.unsplash.com/photo-1511884642898-4c92249e20b6',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07',
  'https://images.unsplash.com/photo-1476673160081-cf065607f449',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  'https://images.unsplash.com/photo-1495615080073-6b89c9839ce0',
  'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5',
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946',
];

function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function importAllBackgrounds() {
  try {
    if (!UNSPLASH_IMAGES.length) {
      console.log('Danh sách URL Unsplash trống!');
      return;
    }

    console.log(`Tìm thấy ${UNSPLASH_IMAGES.length} ảnh từ Unsplash. Bắt đầu import...\n`);

    for (const imageUrl of UNSPLASH_IMAGES) {
      // Random 2-4 emotions từ EMOTION_KEYWORDS
      const emotionCount = getRandomInt(2, 4);
      const emotion = pickRandom(EMOTION_KEYWORDS, emotionCount);

      // Random 3-6 tags từ TAG_KEYWORDS
      const tagCount = getRandomInt(3, 6);
      const tags = pickRandom(TAG_KEYWORDS, tagCount);

      const newBg = await prisma.background.create({
        data: {
          background_url: imageUrl,
          emotion,
          tags,
          source: "SYSTEM",
          is_deleted: false,
        },
      });

      console.log(`Imported: ${imageUrl} -> ID: ${newBg.id}`);
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
