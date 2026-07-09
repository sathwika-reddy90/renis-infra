-- AlterEnum
BEGIN;
CREATE TYPE "InquiryStatus_new" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'VISIT_SCHEDULED', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');
ALTER TABLE "Inquiry" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Inquiry" ALTER COLUMN "status" TYPE "InquiryStatus_new" USING ("status"::text::"InquiryStatus_new");
ALTER TYPE "InquiryStatus" RENAME TO "InquiryStatus_old";
ALTER TYPE "InquiryStatus_new" RENAME TO "InquiryStatus";
DROP TYPE "InquiryStatus_old";
ALTER TABLE "Inquiry" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "followUpDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "visitDate" TIMESTAMP(3),
ADD COLUMN     "visitTime" TEXT;

-- CreateTable
CREATE TABLE "InquiryStatusHistory" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "fromStatus" "InquiryStatus",
    "toStatus" "InquiryStatus" NOT NULL,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InquiryStatusHistory_inquiryId_idx" ON "InquiryStatusHistory"("inquiryId");

-- CreateIndex
CREATE INDEX "Inquiry_assignedToId_idx" ON "Inquiry"("assignedToId");

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryStatusHistory" ADD CONSTRAINT "InquiryStatusHistory_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryStatusHistory" ADD CONSTRAINT "InquiryStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

