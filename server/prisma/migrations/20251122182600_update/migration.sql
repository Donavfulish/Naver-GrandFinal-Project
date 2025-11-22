/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ai_generated_contents" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "backgrounds" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "notes" DROP COLUMN "is_deleted",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "playlists" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "space_tags" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tracks" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
