-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_space_id_fkey";

-- AlterTable
ALTER TABLE "playlists" ALTER COLUMN "space_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
