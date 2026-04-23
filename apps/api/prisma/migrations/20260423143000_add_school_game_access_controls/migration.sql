CREATE TABLE "school_enabled_games" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "game_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_enabled_games_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "school_enabled_characters" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "character_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_enabled_characters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "school_enabled_games_school_id_game_slug_key" ON "school_enabled_games"("school_id", "game_slug");
CREATE INDEX "school_enabled_games_school_id_idx" ON "school_enabled_games"("school_id");
CREATE INDEX "school_enabled_games_game_slug_idx" ON "school_enabled_games"("game_slug");

CREATE UNIQUE INDEX "school_enabled_characters_school_id_character_slug_key" ON "school_enabled_characters"("school_id", "character_slug");
CREATE INDEX "school_enabled_characters_school_id_idx" ON "school_enabled_characters"("school_id");
CREATE INDEX "school_enabled_characters_character_slug_idx" ON "school_enabled_characters"("character_slug");

ALTER TABLE "school_enabled_games" ADD CONSTRAINT "school_enabled_games_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "school_enabled_characters" ADD CONSTRAINT "school_enabled_characters_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "school_enabled_characters" ADD CONSTRAINT "school_enabled_characters_character_slug_fkey" FOREIGN KEY ("character_slug") REFERENCES "characters"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
