-- CreateTable
CREATE TABLE "ActionButton" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "bgColor" TEXT,
    "textColor" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionButton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionButton_isActive_sortOrder_idx" ON "ActionButton"("isActive", "sortOrder");
