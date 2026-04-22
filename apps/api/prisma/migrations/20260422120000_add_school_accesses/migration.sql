CREATE TABLE "school_accesses" (
  "id" TEXT NOT NULL,
  "school_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "school_accesses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "school_accesses_school_id_user_id_key"
ON "school_accesses"("school_id", "user_id");

CREATE INDEX "school_accesses_school_id_idx"
ON "school_accesses"("school_id");

CREATE INDEX "school_accesses_user_id_idx"
ON "school_accesses"("user_id");

ALTER TABLE "school_accesses"
ADD CONSTRAINT "school_accesses_school_id_fkey"
FOREIGN KEY ("school_id") REFERENCES "schools"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "school_accesses"
ADD CONSTRAINT "school_accesses_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
