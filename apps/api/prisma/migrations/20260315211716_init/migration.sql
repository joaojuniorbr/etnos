-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" VARCHAR(255),
    "parent_name" VARCHAR(255),
    "child_name" VARCHAR(255),
    "child_birth_date" VARCHAR(50),
    "parent_phone" VARCHAR(50),
    "school" VARCHAR(255),
    "roles" TEXT[] DEFAULT ARRAY['student']::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255),
    "state" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_configs" (
    "id" TEXT NOT NULL,
    "game_slug" VARCHAR(255) NOT NULL,
    "character_slug" VARCHAR(255) NOT NULL,
    "image_cover_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_game_contents" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "character_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_game_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_scores" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "character_slug" VARCHAR(255) NOT NULL,
    "score" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "midia" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "folder" VARCHAR(255),
    "path" VARCHAR(500),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "midia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "characters_slug_key" ON "characters"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "game_configs_game_slug_character_slug_key" ON "game_configs"("game_slug", "character_slug");

-- CreateIndex
CREATE INDEX "memory_game_contents_slug_idx" ON "memory_game_contents"("slug");

-- CreateIndex
CREATE INDEX "game_scores_user_id_idx" ON "game_scores"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_scores_slug_character_slug_user_id_key" ON "game_scores"("slug", "character_slug", "user_id");

-- CreateIndex
CREATE INDEX "midia_user_id_idx" ON "midia"("user_id");

-- CreateIndex
CREATE INDEX "midia_folder_idx" ON "midia"("folder");

-- AddForeignKey
ALTER TABLE "game_configs" ADD CONSTRAINT "game_configs_character_slug_fkey" FOREIGN KEY ("character_slug") REFERENCES "characters"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_scores" ADD CONSTRAINT "game_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "midia" ADD CONSTRAINT "midia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
