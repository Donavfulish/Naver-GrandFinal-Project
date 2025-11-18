import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLOCK_FONTS = [
  'Roboto',
  'Momo signature',
  'Permanent Marker',
  'Indie Flower',
  'Edu TAS Beginner',
  'Andika',
  'Hanalei Fill',
  'Spectral',
  'Special Elite'
];

async function importClockFonts() {
  try {
    console.log('Bắt đầu import Clock Fonts...\n');

    for (const fontName of CLOCK_FONTS) {
      const newFont = await prisma.clockFont.create({
        data: {
          font_name: fontName,
          is_deleted: false,
        },
      });

      console.log(`✓ Imported Clock Font: ${fontName} (ID: ${newFont.id})`);
    }

    console.log(`\n✅ Hoàn tất import ${CLOCK_FONTS.length} Clock Fonts!`);
  } catch (error) {
    console.error('❌ Lỗi khi import clock fonts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importClockFonts();

