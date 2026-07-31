-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "developerLogo" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "heroImages" TEXT[],
ADD COLUMN     "highlights" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "landingHero" JSONB NOT NULL,
    "heroSlides" JSONB NOT NULL,
    "launch" JSONB NOT NULL,
    "whyUs" JSONB NOT NULL,
    "invest" JSONB NOT NULL,
    "about" JSONB NOT NULL,
    "timeline" JSONB NOT NULL,
    "offices" JSONB NOT NULL,
    "ctaBands" JSONB NOT NULL,
    "nav" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_featured_idx" ON "Property"("featured");

-- CreateIndex
CREATE INDEX "Property_order_idx" ON "Property"("order");
