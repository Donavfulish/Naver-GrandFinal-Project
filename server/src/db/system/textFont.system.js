import 'dotenv/config';
import { PrismaClient } from '@prisma/client'
import { TEXT_FONTS } from '../../constants/state.js';

const prisma = new PrismaClient();


async function importTextFonts() {
  try {
    console.log('Bắt đầu import Text Fonts...\n');

    for (const fontName of TEXT_FONTS) {
      const newFont = await prisma.textFont.create({
        data: {
          font_name: fontName,
          is_deleted: false,
        },
      });

      console.log(`✓ Imported Text Font: ${fontName} (ID: ${newFont.id})`);
    }

    console.log(`\n✅ Hoàn tất import ${TEXT_FONTS.length} Text Fonts!`);
  } catch (error) {
    console.error('❌ Lỗi khi import text fonts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importTextFonts();

