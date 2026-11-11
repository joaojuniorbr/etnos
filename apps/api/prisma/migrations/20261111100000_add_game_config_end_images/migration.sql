-- AlterTable
ALTER TABLE "game_configs"
  ALTER COLUMN "image_cover_url" DROP NOT NULL,
  ADD COLUMN "image_success_url" TEXT,
  ADD COLUMN "image_error_url" TEXT;
