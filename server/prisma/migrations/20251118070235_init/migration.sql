-- AlterTable
ALTER TABLE "clock_fonts" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "notes" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "playlist_tracks" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "text_fonts" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tracks" ADD COLUMN     "thumbnail" TEXT;

-- AlterTable
ALTER TABLE "widget_positions" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
