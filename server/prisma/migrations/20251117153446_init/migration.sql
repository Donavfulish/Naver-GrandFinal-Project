/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `space_tags` table. All the data in the column will be lost.
  - You are about to drop the column `text_font_name` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `spotify_track_id` on the `tracks` table. All the data in the column will be lost.
  - You are about to drop the column `widget_id` on the `widget_positions` table. All the data in the column will be lost.
  - You are about to drop the `clocks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fonts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fork_spaces` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[playlist_id,track_id]` on the table `playlist_tracks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[space_id,tag_id]` on the table `space_tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `track_url` to the `tracks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BackgroundSource" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TrackSource" AS ENUM ('SYSTEM', 'USER');

-- DropForeignKey
ALTER TABLE "fork_spaces" DROP CONSTRAINT "fork_spaces_original_space_id_fkey";

-- DropForeignKey
ALTER TABLE "fork_spaces" DROP CONSTRAINT "fork_spaces_user_id_fkey";

-- DropForeignKey
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_clock_font_id_fkey";

-- DropForeignKey
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_text_font_name_fkey";

-- DropIndex
DROP INDEX "tracks_spotify_track_id_idx";

-- DropIndex
DROP INDEX "tracks_spotify_track_id_key";

-- AlterTable
ALTER TABLE "backgrounds" ADD COLUMN     "emotion" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "source" "BackgroundSource" NOT NULL DEFAULT 'USER',
ADD COLUMN     "topic" TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "playlist_tracks" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "playlists" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "space_tags" DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "text_font_name",
ADD COLUMN     "text_font_id" TEXT;

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "is_deleted",
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tracks" DROP COLUMN "spotify_track_id",
ADD COLUMN     "emotion" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "source" "TrackSource" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "track_url" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "widget_positions" DROP COLUMN "widget_id",
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "clocks";

-- DropTable
DROP TABLE "fonts";

-- DropTable
DROP TABLE "fork_spaces";

-- CreateTable
CREATE TABLE "clock_fonts" (
    "id" TEXT NOT NULL,
    "font_name" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clock_fonts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_fonts" (
    "id" TEXT NOT NULL,
    "font_name" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "text_fonts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "playlist_tracks_playlist_id_track_id_key" ON "playlist_tracks"("playlist_id", "track_id");

-- CreateIndex
CREATE INDEX "space_tags_space_id_idx" ON "space_tags"("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_tags_space_id_tag_id_key" ON "space_tags"("space_id", "tag_id");

-- CreateIndex
CREATE INDEX "spaces_background_id_idx" ON "spaces"("background_id");

-- CreateIndex
CREATE INDEX "spaces_clock_font_id_idx" ON "spaces"("clock_font_id");

-- CreateIndex
CREATE INDEX "spaces_text_font_id_idx" ON "spaces"("text_font_id");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_clock_font_id_fkey" FOREIGN KEY ("clock_font_id") REFERENCES "clock_fonts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_text_font_id_fkey" FOREIGN KEY ("text_font_id") REFERENCES "text_fonts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
