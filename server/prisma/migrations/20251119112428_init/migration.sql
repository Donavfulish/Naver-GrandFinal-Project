/*
  Warnings:

  - You are about to drop the `widget_positions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "widget_positions" DROP CONSTRAINT "widget_positions_space_id_fkey";

-- DropTable
DROP TABLE "widget_positions";
