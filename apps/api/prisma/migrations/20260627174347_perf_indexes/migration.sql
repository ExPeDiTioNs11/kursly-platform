-- CreateIndex
CREATE INDEX "courses_status_createdAt_idx" ON "courses"("status", "createdAt");

-- CreateIndex
CREATE INDEX "internships_status_createdAt_idx" ON "internships"("status", "createdAt");

-- Trigram (pg_trgm) GIN indexes so ILIKE '%term%' searches stay fast at scale.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "courses_title_trgm_idx" ON "courses" USING gin ("title" gin_trgm_ops);
CREATE INDEX "courses_subtitle_trgm_idx" ON "courses" USING gin ("subtitle" gin_trgm_ops);
CREATE INDEX "internships_title_trgm_idx" ON "internships" USING gin ("title" gin_trgm_ops);
CREATE INDEX "internships_description_trgm_idx" ON "internships" USING gin ("description" gin_trgm_ops);
