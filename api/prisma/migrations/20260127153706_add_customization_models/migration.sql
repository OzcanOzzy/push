-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "heroBackgroundUrl" TEXT,
ADD COLUMN     "heroOverlayColor" TEXT,
ADD COLUMN     "heroOverlayOpacity" DOUBLE PRECISION,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "logoHeight" INTEGER,
ADD COLUMN     "logoPositionX" INTEGER,
ADD COLUMN     "logoPositionY" INTEGER,
ADD COLUMN     "logoTagline" TEXT,
ADD COLUMN     "logoTaglineColor" TEXT,
ADD COLUMN     "logoTaglineFont" TEXT,
ADD COLUMN     "logoTaglineFontSize" INTEGER,
ADD COLUMN     "logoWidth" INTEGER,
ADD COLUMN     "profileImageHeight" INTEGER,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "profileImageWidth" INTEGER,
ADD COLUMN     "profileNameColor" TEXT,
ADD COLUMN     "profileNameFont" TEXT,
ADD COLUMN     "profileNameSize" INTEGER,
ADD COLUMN     "profilePositionX" INTEGER,
ADD COLUMN     "profilePositionY" INTEGER,
ADD COLUMN     "profileTitleColor" TEXT,
ADD COLUMN     "profileTitleFont" TEXT,
ADD COLUMN     "profileTitleLabel" TEXT,
ADD COLUMN     "profileTitleSize" INTEGER,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- CreateTable
CREATE TABLE "CityButton" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "iconColor" TEXT,
    "bgColor" TEXT,
    "borderColor" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityButton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "position" TEXT NOT NULL DEFAULT 'home-top',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CityButton_slug_key" ON "CityButton"("slug");

-- CreateIndex
CREATE INDEX "CityButton_sortOrder_idx" ON "CityButton"("sortOrder");

-- CreateIndex
CREATE INDEX "Banner_position_isActive_sortOrder_idx" ON "Banner"("position", "isActive", "sortOrder");

-- AddForeignKey
ALTER TABLE "CityButton" ADD CONSTRAINT "CityButton_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
