import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { EMOTION_KEYWORDS, TAG_KEYWORDS } from '../../constants/state.js';

const prisma = new PrismaClient();

// Danh sách URL ảnh từ Unsplash
const UNSPLASH_IMAGES = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1511884642898-4c92249e20b6",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
    "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    "https://images.unsplash.com/photo-1476673160081-cf065607f449",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
    "https://images.unsplash.com/photo-1495615080073-6b89c9839ce0",
    "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5",
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d",
    "https://images.unsplash.com/photo-1504198453319-5ce911bafcde",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba",
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071",
    "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a",
    "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
    "https://images.unsplash.com/photo-1484417894907-623942c8ee29",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
    "https://images.unsplash.com/photo-1491466424936-e304919aada7",
    "https://images.unsplash.com/photo-1504893524553-b855bce32c67",
    "https://images.unsplash.com/photo-1533460004989-cef01064af7e",
    "https://images.unsplash.com/photo-1528127269322-539801943592",
    "https://images.unsplash.com/photo-1514996937319-344454492b37",
    "https://images.unsplash.com/photo-1520808663317-647b476a81b9",
    "https://images.unsplash.com/photo-1509023464722-18d996393ca8",
    "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "https://images.unsplash.com/photo-1540206395-68808572332f",
    "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1",
    "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843",
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e",
    "https://images.unsplash.com/photo-1479030160180-b1860951d696"
];

function pickRandom(arr, count = 1) {
  return [...arr]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function importAllBackgrounds() {
  try {
    if (UNSPLASH_IMAGES.length === 0) {
      console.log("Danh sách URL Unsplash trống!");
      return;
    }

    console.log(`Tìm thấy ${UNSPLASH_IMAGES.length} ảnh. Bắt đầu import...\n`);

    for (const imageUrl of UNSPLASH_IMAGES) {
      const emotion = pickRandom(EMOTION_KEYWORDS, getRandomInt(2, 4));
      const tags = pickRandom(TAG_KEYWORDS, getRandomInt(3, 6));

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
      console.log(`  Emotions: ${emotion.join(", ")}`);
      console.log(`  Tags: ${tags.join(", ")}\n`);
    }

    console.log("\nHoàn tất import background!");
  } catch (error) {
    console.error("Lỗi khi import background:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllBackgrounds();