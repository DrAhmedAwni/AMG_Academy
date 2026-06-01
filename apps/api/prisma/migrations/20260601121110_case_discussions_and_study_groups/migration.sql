-- CreateEnum
CREATE TYPE "CasePostStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CaseCommentStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'REMOVED');

-- CreateEnum
CREATE TYPE "StudyGroupType" AS ENUM ('STUDENT', 'INSTRUCTOR_LED');

-- CreateEnum
CREATE TYPE "StudyGroupJoinMode" AS ENUM ('OPEN', 'REQUEST', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "StudyGroupStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StudyGroupMemberRole" AS ENUM ('OWNER', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "StudyGroupMemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'REMOVED', 'LEFT');

-- CreateEnum
CREATE TYPE "StudyGroupMessageStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'REMOVED');

-- CreateEnum
CREATE TYPE "StudyGroupFileStatus" AS ENUM ('ACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "StudyGroupSessionStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'HIDE';
ALTER TYPE "AuditAction" ADD VALUE 'REMOVE';
ALTER TYPE "AuditAction" ADD VALUE 'REPORT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'CASE_COMMENT_REPLY';
ALTER TYPE "NotificationType" ADD VALUE 'CASE_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'STUDY_GROUP_NEW_MESSAGE';
ALTER TYPE "NotificationType" ADD VALUE 'STUDY_GROUP_MEMBER_JOINED';

-- CreateTable
CREATE TABLE "CaseCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasePost" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "CasePostStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "deidentifiedAcknowledgedAt" TIMESTAMP(3),
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "upvotedBy" TEXT[],
    "bookmarkedBy" TEXT[],

    CONSTRAINT "CasePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseImage" (
    "id" UUID NOT NULL,
    "casePostId" UUID NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT NOT NULL,
    "caption" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseComment" (
    "id" UUID NOT NULL,
    "casePostId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "parentCommentId" UUID,
    "body" TEXT NOT NULL,
    "status" "CaseCommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "hiddenById" UUID,
    "hiddenReason" TEXT,
    "reportedBy" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroup" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "courseId" UUID,
    "type" "StudyGroupType" NOT NULL,
    "joinMode" "StudyGroupJoinMode" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StudyGroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroupMember" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "StudyGroupMemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "StudyGroupMemberStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" UUID,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroupMessage" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "status" "StudyGroupMessageStatus" NOT NULL DEFAULT 'VISIBLE',
    "hiddenById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyGroupMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroupFile" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "uploadedById" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT NOT NULL,
    "status" "StudyGroupFileStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGroupFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroupSession" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "location" TEXT,
    "onlineUrlNote" TEXT,
    "status" "StudyGroupSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGroupSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseCategory_name_key" ON "CaseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CaseCategory_slug_key" ON "CaseCategory"("slug");

-- CreateIndex
CREATE INDEX "CaseCategory_slug_idx" ON "CaseCategory"("slug");

-- CreateIndex
CREATE INDEX "CaseCategory_status_idx" ON "CaseCategory"("status");

-- CreateIndex
CREATE INDEX "CasePost_authorId_idx" ON "CasePost"("authorId");

-- CreateIndex
CREATE INDEX "CasePost_categoryId_idx" ON "CasePost"("categoryId");

-- CreateIndex
CREATE INDEX "CasePost_status_idx" ON "CasePost"("status");

-- CreateIndex
CREATE INDEX "CasePost_createdAt_idx" ON "CasePost"("createdAt");

-- CreateIndex
CREATE INDEX "CaseImage_casePostId_idx" ON "CaseImage"("casePostId");

-- CreateIndex
CREATE INDEX "CaseComment_casePostId_idx" ON "CaseComment"("casePostId");

-- CreateIndex
CREATE INDEX "CaseComment_authorId_idx" ON "CaseComment"("authorId");

-- CreateIndex
CREATE INDEX "CaseComment_status_idx" ON "CaseComment"("status");

-- CreateIndex
CREATE INDEX "CaseComment_createdAt_idx" ON "CaseComment"("createdAt");

-- CreateIndex
CREATE INDEX "StudyGroup_ownerId_idx" ON "StudyGroup"("ownerId");

-- CreateIndex
CREATE INDEX "StudyGroup_courseId_idx" ON "StudyGroup"("courseId");

-- CreateIndex
CREATE INDEX "StudyGroup_status_idx" ON "StudyGroup"("status");

-- CreateIndex
CREATE INDEX "StudyGroup_type_idx" ON "StudyGroup"("type");

-- CreateIndex
CREATE INDEX "StudyGroupMember_groupId_idx" ON "StudyGroupMember"("groupId");

-- CreateIndex
CREATE INDEX "StudyGroupMember_userId_idx" ON "StudyGroupMember"("userId");

-- CreateIndex
CREATE INDEX "StudyGroupMember_status_idx" ON "StudyGroupMember"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StudyGroupMember_groupId_userId_key" ON "StudyGroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "StudyGroupMessage_groupId_idx" ON "StudyGroupMessage"("groupId");

-- CreateIndex
CREATE INDEX "StudyGroupMessage_authorId_idx" ON "StudyGroupMessage"("authorId");

-- CreateIndex
CREATE INDEX "StudyGroupMessage_createdAt_idx" ON "StudyGroupMessage"("createdAt");

-- CreateIndex
CREATE INDEX "StudyGroupFile_groupId_idx" ON "StudyGroupFile"("groupId");

-- CreateIndex
CREATE INDEX "StudyGroupFile_uploadedById_idx" ON "StudyGroupFile"("uploadedById");

-- CreateIndex
CREATE INDEX "StudyGroupSession_groupId_idx" ON "StudyGroupSession"("groupId");

-- CreateIndex
CREATE INDEX "StudyGroupSession_createdById_idx" ON "StudyGroupSession"("createdById");

-- CreateIndex
CREATE INDEX "StudyGroupSession_startsAt_idx" ON "StudyGroupSession"("startsAt");

-- CreateIndex
CREATE INDEX "StudyGroupSession_status_idx" ON "StudyGroupSession"("status");

-- AddForeignKey
ALTER TABLE "CasePost" ADD CONSTRAINT "CasePost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePost" ADD CONSTRAINT "CasePost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CaseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePost" ADD CONSTRAINT "CasePost_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseImage" ADD CONSTRAINT "CaseImage_casePostId_fkey" FOREIGN KEY ("casePostId") REFERENCES "CasePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_casePostId_fkey" FOREIGN KEY ("casePostId") REFERENCES "CasePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "CaseComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroup" ADD CONSTRAINT "StudyGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroup" ADD CONSTRAINT "StudyGroup_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMessage" ADD CONSTRAINT "StudyGroupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMessage" ADD CONSTRAINT "StudyGroupMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupFile" ADD CONSTRAINT "StudyGroupFile_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupFile" ADD CONSTRAINT "StudyGroupFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupSession" ADD CONSTRAINT "StudyGroupSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupSession" ADD CONSTRAINT "StudyGroupSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
