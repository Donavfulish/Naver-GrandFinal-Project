/*
  Warnings:

  - Added the required column `name` to the `spaces` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_text_font_name_fkey";

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "text_font_name" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_text_font_name_fkey" FOREIGN KEY ("text_font_name") REFERENCES "fonts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
