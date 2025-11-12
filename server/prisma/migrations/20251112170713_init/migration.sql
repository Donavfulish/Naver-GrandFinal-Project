/*
  Warnings:

  - You are about to drop the column `default_font_id` on the `clocks` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `clocks` table. All the data in the column will be lost.
  - You are about to drop the column `preview_image` on the `clocks` table. All the data in the column will be lost.
  - You are about to drop the column `shape` on the `clocks` table. All the data in the column will be lost.
  - The primary key for the `playlist_tracks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spotify_playlist_id` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `playlists` table. All the data in the column will be lost.
  - The primary key for the `space_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `background_gif_id` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `clock_id` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `album_art_url` on the `tracks` table. All the data in the column will be lost.
  - You are about to drop the column `artist` on the `tracks` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `tracks` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `tracks` table. All the data in the column will be lost.
  - You are about to drop the column `position_x` on the `widget_positions` table. All the data in the column will be lost.
  - You are about to drop the column `position_y` on the `widget_positions` table. All the data in the column will be lost.
  - You are about to drop the column `widget_name` on the `widget_positions` table. All the data in the column will be lost.
  - You are about to drop the `space_playlists` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `font_name` to the `clocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `clocks` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `playlist_tracks` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `playlist_tracks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `space_id` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `space_tags` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `space_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text_font_name` to the `spaces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `spaces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `spaces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tracks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `widget_positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `widget_id` to the `widget_positions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "playlist_tracks" DROP CONSTRAINT "playlist_tracks_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "playlist_tracks" DROP CONSTRAINT "playlist_tracks_track_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_user_id_fkey";

-- DropForeignKey
ALTER TABLE "space_playlists" DROP CONSTRAINT "space_playlists_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "space_playlists" DROP CONSTRAINT "space_playlists_space_id_fkey";

-- DropForeignKey
ALTER TABLE "space_tags" DROP CONSTRAINT "space_tags_space_id_fkey";

-- DropForeignKey
ALTER TABLE "space_tags" DROP CONSTRAINT "space_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_clock_id_fkey";

-- DropForeignKey
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_user_id_fkey";

-- DropForeignKey
ALTER TABLE "widget_positions" DROP CONSTRAINT "widget_positions_space_id_fkey";

-- DropIndex
DROP INDEX "playlists_user_id_idx";

-- DropIndex
DROP INDEX "widget_positions_space_id_widget_name_key";

-- AlterTable
ALTER TABLE "clocks" DROP COLUMN "default_font_id",
DROP COLUMN "name",
DROP COLUMN "preview_image",
DROP COLUMN "shape",
ADD COLUMN     "font_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "playlist_tracks" DROP CONSTRAINT "playlist_tracks_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "spotify_playlist_id",
DROP COLUMN "user_id",
ADD COLUMN     "space_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "space_tags" DROP CONSTRAINT "space_tags_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "space_tags_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "background_gif_id",
DROP COLUMN "clock_id",
DROP COLUMN "name",
ADD COLUMN     "background_id" TEXT,
ADD COLUMN     "clock_font_id" TEXT,
ADD COLUMN     "text_font_name" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tracks" DROP COLUMN "album_art_url",
DROP COLUMN "artist",
DROP COLUMN "duration",
DROP COLUMN "title",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "widget_positions" DROP COLUMN "position_x",
DROP COLUMN "position_y",
DROP COLUMN "widget_name",
ADD COLUMN     "position" JSONB NOT NULL,
ADD COLUMN     "widget_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "space_playlists";

-- CreateTable
CREATE TABLE "backgrounds" (
    "id" TEXT NOT NULL,
    "background_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backgrounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fonts" (
    "id" TEXT NOT NULL,
    "font_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fonts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playlists_space_id_idx" ON "playlists"("space_id");

-- CreateIndex
CREATE INDEX "space_tags_tag_id_idx" ON "space_tags"("tag_id");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_clock_font_id_fkey" FOREIGN KEY ("clock_font_id") REFERENCES "clocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_text_font_name_fkey" FOREIGN KEY ("text_font_name") REFERENCES "fonts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_background_id_fkey" FOREIGN KEY ("background_id") REFERENCES "backgrounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_positions" ADD CONSTRAINT "widget_positions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_tags" ADD CONSTRAINT "space_tags_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_tags" ADD CONSTRAINT "space_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
