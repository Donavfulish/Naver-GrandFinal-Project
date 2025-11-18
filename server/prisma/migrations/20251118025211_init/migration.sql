/*
  Warnings:

  - You are about to drop the column `topic` on the `backgrounds` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `tracks` table. All the data in the column will be lost.
  - Added the required column `name` to the `tracks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "backgrounds" DROP COLUMN "topic",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "tracks" DROP COLUMN "topic",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "note_order" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);
