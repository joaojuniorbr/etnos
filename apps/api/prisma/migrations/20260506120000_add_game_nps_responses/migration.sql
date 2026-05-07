-- CreateTable
CREATE TABLE "game_nps_responses" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "user_id" VARCHAR(255) NOT NULL,
    "character_slug" VARCHAR(255) NOT NULL,
    "game_slug" VARCHAR(255) NOT NULL,
    "school_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_nps_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_nps_responses_user_id_idx" ON "game_nps_responses"("user_id");

-- CreateIndex
CREATE INDEX "game_nps_responses_school_id_idx" ON "game_nps_responses"("school_id");

-- CreateIndex
CREATE INDEX "game_nps_responses_game_slug_idx" ON "game_nps_responses"("game_slug");

-- CreateIndex
CREATE INDEX "game_nps_responses_created_at_idx" ON "game_nps_responses"("created_at");
