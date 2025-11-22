/*
  Warnings:

  - You are about to drop the column `personalityEssence` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `mind` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "personalityEssence";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "mind";
