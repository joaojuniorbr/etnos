CREATE TABLE "guess_game_contents" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "word" VARCHAR(255) NOT NULL,
    "tips" TEXT[],
    "image_url" TEXT,
    "description" TEXT NOT NULL,
    "character_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guess_game_contents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "guess_game_contents_character_slug_idx" ON "guess_game_contents"("character_slug");
