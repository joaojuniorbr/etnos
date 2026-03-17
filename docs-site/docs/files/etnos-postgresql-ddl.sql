-- Etnos - PostgreSQL DDL
-- Fonte de verdade da modelagem: apps/api/prisma/schema.prisma
-- Arquivo preparado para uso em ferramentas como drawsql.app

CREATE TABLE users (
  id VARCHAR(191) PRIMARY KEY,
  firebase_uid VARCHAR(191) NOT NULL UNIQUE,
  email VARCHAR(255),
  parent_name VARCHAR(255),
  child_name VARCHAR(255),
  child_birth_date VARCHAR(50),
  parent_phone VARCHAR(50),
  school VARCHAR(255),
  roles TEXT[] NOT NULL DEFAULT ARRAY['student'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schools (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(255),
  state VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ADD CONSTRAINT users_school_fkey
  FOREIGN KEY (school)
  REFERENCES schools(id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

CREATE TABLE characters (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE game_configs (
  id VARCHAR(191) PRIMARY KEY,
  game_slug VARCHAR(255) NOT NULL,
  character_slug VARCHAR(255) NOT NULL,
  image_cover_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT game_configs_game_slug_character_slug_key
    UNIQUE (game_slug, character_slug),
  CONSTRAINT game_configs_character_slug_fkey
    FOREIGN KEY (character_slug)
    REFERENCES characters(slug)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE memory_game_contents (
  id VARCHAR(191) PRIMARY KEY,
  url TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  character_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE memory_game_contents
  ADD CONSTRAINT memory_game_contents_character_id_fkey
  FOREIGN KEY (character_id)
  REFERENCES characters(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

CREATE INDEX memory_game_contents_slug_idx
  ON memory_game_contents (slug);

CREATE TABLE game_scores (
  id VARCHAR(191) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  character_slug VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT game_scores_slug_character_slug_user_id_key
    UNIQUE (slug, character_slug, user_id)
);

ALTER TABLE game_scores
  ADD CONSTRAINT game_scores_character_slug_fkey
  FOREIGN KEY (character_slug)
  REFERENCES characters(slug)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

ALTER TABLE game_scores
  ADD CONSTRAINT game_scores_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(firebase_uid)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

CREATE INDEX game_scores_user_id_idx
  ON game_scores (user_id);

CREATE TABLE midia (
  id VARCHAR(191) PRIMARY KEY,
  url TEXT NOT NULL,
  folder VARCHAR(255),
  path VARCHAR(500),
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE midia
  ADD CONSTRAINT midia_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(firebase_uid)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

CREATE INDEX midia_user_id_idx
  ON midia (user_id);

CREATE INDEX midia_folder_idx
  ON midia (folder);
