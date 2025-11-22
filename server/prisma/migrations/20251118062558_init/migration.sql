/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "ai_genarated" TEXT;

-- DropTable
DROP TABLE "Note";

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "note_order" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notes_space_id_idx" ON "notes"("space_id");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
