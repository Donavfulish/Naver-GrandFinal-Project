/*
  Warnings:

  - You are about to drop the column `mood` on the `ai_generated_contents` table. All the data in the column will be lost.
  - Added the required column `mood` to the `spaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ai_generated_contents" DROP COLUMN "mood";

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "mood" TEXT NOT NULL;
