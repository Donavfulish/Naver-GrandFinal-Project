/*
  Warnings:

  - You are about to drop the column `font_name` on the `clock_fonts` table. All the data in the column will be lost.
  - Added the required column `mood` to the `ai_generated_contents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `style` to the `clock_fonts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ai_generated_contents" ADD COLUMN     "mood" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "clock_fonts" DROP COLUMN "font_name",
ADD COLUMN     "style" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0;
