-- Outcome images belong to the character and are shared by every game.
ALTER TABLE "characters"
  ADD COLUMN "image_success_url" TEXT,
  ADD COLUMN "image_error_url" TEXT;

-- Preserve existing choices. Prefer the word game, then the most recent config.
-- Resolve each image separately so a missing image does not hide another choice.
UPDATE "characters" AS c
SET "image_success_url" = (
  SELECT config."image_success_url"
  FROM "game_configs" AS config
  WHERE config."character_slug" = c."slug"
    AND NULLIF(config."image_success_url", '') IS NOT NULL
  ORDER BY (config."game_slug" = 'guess-game') DESC, config."updated_at" DESC, config."id"
  LIMIT 1
), "image_error_url" = (
  SELECT config."image_error_url"
  FROM "game_configs" AS config
  WHERE config."character_slug" = c."slug"
    AND NULLIF(config."image_error_url", '') IS NOT NULL
  ORDER BY (config."game_slug" = 'guess-game') DESC, config."updated_at" DESC, config."id"
  LIMIT 1
);

ALTER TABLE "game_configs"
  DROP COLUMN "image_success_url",
  DROP COLUMN "image_error_url";
