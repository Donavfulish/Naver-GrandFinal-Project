/*
  Warnings:

  - You are about to drop the column `mood` on the `ai_generated_contents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[space_id]` on the table `ai_generated_contents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mood` to the `spaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ai_generated_contents" DROP COLUMN "mood";

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "mood" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ai_generated_contents_space_id_key" ON "ai_generated_contents"("space_id");
