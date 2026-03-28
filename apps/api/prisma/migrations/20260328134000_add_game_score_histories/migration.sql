CREATE TABLE "game_score_histories" (
    "id" TEXT NOT NULL,
    "game_slug" VARCHAR(255) NOT NULL,
    "character_slug" VARCHAR(255) NOT NULL,
    "score" INTEGER NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "school_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_score_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "game_score_histories_user_id_idx" ON "game_score_histories"("user_id");
CREATE INDEX "game_score_histories_school_id_idx" ON "game_score_histories"("school_id");
CREATE INDEX "game_score_histories_game_slug_idx" ON "game_score_histories"("game_slug");
