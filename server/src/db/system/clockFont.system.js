import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { CLOCK_FONTS_STYLE } from '../../constants/state.js';

const prisma = new PrismaClient();



async function importClockFonts() {
  try {
    console.log('Bắt đầu import Clock Fonts...\n');

    for (const fontStyle of CLOCK_FONTS_STYLE) {
      const newFont = await prisma.clockFont.create({
        data: {
          style: fontStyle,
          is_deleted: false,
        },
      });

      console.log(`✓ Imported Clock Font: ${fontStyle} (ID: ${newFont.id})`);
    }

    console.log(`\n✅ Hoàn tất import ${CLOCK_FONTS_STYLE.length} Clock Fonts!`);
  } catch (error) {
    console.error('❌ Lỗi khi import clock fonts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importClockFonts();
