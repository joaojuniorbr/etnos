-- AlterTable
ALTER TABLE "game_score_histories" ADD COLUMN "started_at" TIMESTAMP(3);
ALTER TABLE "game_score_histories" ADD COLUMN "ended_at" TIMESTAMP(3);
ALTER TABLE "game_score_histories" ADD COLUMN "status" VARCHAR(32) NOT NULL DEFAULT 'completed';

UPDATE "game_score_histories"
SET
  "started_at" = "created_at",
  "ended_at" = "created_at"
WHERE "started_at" IS NULL;

ALTER TABLE "game_score_histories" ALTER COLUMN "started_at" SET NOT NULL;
ALTER TABLE "game_score_histories" ALTER COLUMN "started_at" SET DEFAULT CURRENT_TIMESTAMP;
