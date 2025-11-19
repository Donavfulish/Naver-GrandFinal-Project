/*
  Warnings:

  - You are about to drop the column `ai_genarated` on the `spaces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "ai_genarated";

-- CreateTable
CREATE TABLE "ai_generated_contents" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "prompt" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generated_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_generated_contents_space_id_idx" ON "ai_generated_contents"("space_id");

-- AddForeignKey
ALTER TABLE "ai_generated_contents" ADD CONSTRAINT "ai_generated_contents_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
