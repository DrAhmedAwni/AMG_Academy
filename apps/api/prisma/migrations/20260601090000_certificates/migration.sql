-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('PENDING_REVIEW', 'RELEASED', 'REVOKED', 'VOIDED');

-- CreateEnum
CREATE TYPE "CertificateSourceType" AS ENUM ('EVENT', 'COURSE');

-- CreateEnum
CREATE TYPE "CertificateTemplateStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CertificateTemplateScope" AS ENUM ('EVENT', 'COURSE', 'BOTH');

-- CreateTable
CREATE TABLE "CertificateTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "CertificateTemplateScope" NOT NULL DEFAULT 'BOTH',
    "status" "CertificateTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "layoutConfig" JSONB NOT NULL DEFAULT '{}',
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" UUID NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "sourceType" "CertificateSourceType" NOT NULL,
    "sourceId" UUID NOT NULL,
    "eventId" UUID,
    "courseId" UUID,
    "templateId" UUID,
    "status" "CertificateStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "learnerName" TEXT NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "issuerName" TEXT NOT NULL DEFAULT 'AMG Academy',
    "issuedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "hours" DECIMAL(8,2),
    "credits" DECIMAL(8,2),
    "pdfStorageProvider" TEXT,
    "pdfStorageKey" TEXT,
    "reviewNotes" TEXT,
    "invalidReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedById" UUID,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CertificateTemplate_scope_idx" ON "CertificateTemplate"("scope");

-- CreateIndex
CREATE INDEX "CertificateTemplate_status_idx" ON "CertificateTemplate"("status");

-- CreateIndex
CREATE INDEX "CertificateTemplate_isDefault_idx" ON "CertificateTemplate"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON "Certificate"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_sourceType_sourceId_key" ON "Certificate"("userId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_sourceType_sourceId_idx" ON "Certificate"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");

-- CreateIndex
CREATE INDEX "Certificate_eventId_idx" ON "Certificate"("eventId");

-- CreateIndex
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");

-- CreateIndex
CREATE INDEX "Certificate_releasedAt_idx" ON "Certificate"("releasedAt");

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
