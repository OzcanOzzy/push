-- CreateEnum
CREATE TYPE "ListingAttributeType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'BOOLEAN');

-- CreateTable
CREATE TABLE "ListingAttributeDefinition" (
    "id" TEXT NOT NULL,
    "category" "ListingCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "ListingAttributeType" NOT NULL,
    "options" JSONB,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingAttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingAttributeDefinition_category_sortOrder_idx" ON "ListingAttributeDefinition"("category", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ListingAttributeDefinition_category_key_key" ON "ListingAttributeDefinition"("category", "key");
