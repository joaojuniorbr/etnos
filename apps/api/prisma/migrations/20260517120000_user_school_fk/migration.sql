-- AlterTable
ALTER TABLE "users" ADD COLUMN "school_id" VARCHAR(255);

-- Backfill from legacy school column (id or code)
UPDATE "users" AS u
SET "school_id" = s."id"
FROM "schools" AS s
WHERE u."school" IS NOT NULL
  AND (u."school" = s."id" OR (s."code" IS NOT NULL AND u."school" = s."code"));

-- DropIndex
DROP INDEX IF EXISTS "users_school_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "school";

-- CreateIndex
CREATE INDEX "users_school_id_idx" ON "users"("school_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
