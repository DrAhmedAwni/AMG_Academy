-- CreateEnum
CREATE TYPE "PaymentItemType" AS ENUM ('EVENT', 'COURSE');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MOCK', 'MANUAL', 'PAYMOB');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "checkoutUrl" TEXT,
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "itemType" "PaymentItemType" NOT NULL DEFAULT 'EVENT',
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ALTER COLUMN "provider" SET DEFAULT 'MOCK';

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerRef" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "responsePayload" JSONB,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentId_idx" ON "PaymentAttempt"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_status_idx" ON "PaymentAttempt"("status");

-- CreateIndex
CREATE INDEX "PaymentAttempt_provider_idx" ON "PaymentAttempt"("provider");

-- CreateIndex
CREATE INDEX "PaymentAttempt_providerRef_idx" ON "PaymentAttempt"("providerRef");

-- CreateIndex
CREATE INDEX "Payment_itemType_idx" ON "Payment"("itemType");

-- CreateIndex
CREATE INDEX "Payment_registrationId_idx" ON "Payment"("registrationId");

-- CreateIndex
CREATE INDEX "Payment_enrollmentId_idx" ON "Payment"("enrollmentId");

-- CreateIndex
CREATE INDEX "Payment_verifiedById_idx" ON "Payment"("verifiedById");

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
