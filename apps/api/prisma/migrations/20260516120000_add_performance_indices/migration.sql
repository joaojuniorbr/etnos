-- CreateIndex
CREATE INDEX "users_school_idx" ON "users"("school");

-- CreateIndex
CREATE INDEX "users_notifications_enabled_idx" ON "users"("notifications_enabled");

-- CreateIndex
CREATE INDEX "game_configs_game_slug_idx" ON "game_configs"("game_slug");

-- CreateIndex
CREATE INDEX "memory_game_contents_character_id_idx" ON "memory_game_contents"("character_id");

-- CreateIndex
CREATE INDEX "game_scores_slug_character_slug_idx" ON "game_scores"("slug", "character_slug");

-- CreateIndex
CREATE INDEX "game_score_histories_user_id_status_idx" ON "game_score_histories"("user_id", "status");

-- CreateIndex
CREATE INDEX "game_score_histories_user_game_started_at_idx" ON "game_score_histories"("user_id", "game_slug", "started_at" DESC);

-- CreateIndex
CREATE INDEX "game_score_histories_user_school_started_at_idx" ON "game_score_histories"("user_id", "school_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "midia_user_id_folder_idx" ON "midia"("user_id", "folder");

-- CreateIndex
CREATE INDEX "midia_user_id_created_at_idx" ON "midia"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notification_logs_school_id_idx" ON "notification_logs"("school_id");
