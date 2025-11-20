/*
  Warnings:

  - A unique constraint covering the columns `[space_id]` on the table `ai_generated_contents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ai_generated_contents_space_id_key" ON "ai_generated_contents"("space_id");
