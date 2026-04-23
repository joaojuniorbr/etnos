ALTER TABLE "schools"
ADD COLUMN "code" VARCHAR(100);

CREATE UNIQUE INDEX "schools_code_key"
ON "schools"("code");
