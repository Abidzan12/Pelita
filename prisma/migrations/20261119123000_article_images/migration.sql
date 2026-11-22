ALTER TABLE "Article"
ADD COLUMN "imageStorageKey" TEXT,
ADD COLUMN "imageMimeType" TEXT,
ADD COLUMN "imageSizeBytes" INTEGER,
ADD COLUMN "imageIv" BYTEA,
ADD COLUMN "imageAuthTag" BYTEA,
ADD COLUMN "imageAlt" TEXT;

CREATE UNIQUE INDEX "Article_imageStorageKey_key" ON "Article"("imageStorageKey");
