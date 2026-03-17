/*
  Warnings:

  - You are about to alter the column `user_id` on the `game_scores` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `user_id` on the `midia` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "game_scores" DROP CONSTRAINT "game_scores_user_id_fkey";

-- DropForeignKey
ALTER TABLE "midia" DROP CONSTRAINT "midia_user_id_fkey";

-- AlterTable
ALTER TABLE "game_scores" ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "midia" ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255);
