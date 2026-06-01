-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'DELETED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED', 'MANUALLY_VERIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QRTicketStatus" AS ENUM ('NOT_ISSUED', 'ACTIVE', 'USED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentPageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REGISTRATION_SUBMITTED', 'REGISTRATION_APPROVED', 'REGISTRATION_REJECTED', 'PAYMENT_SUCCESSFUL', 'PAYMENT_FAILED', 'QR_ISSUED', 'EVENT_REMINDER', 'EVENT_CANCELLED', 'NEW_ANNOUNCEMENT', 'NEW_COURSE_PUBLISHED');

-- CreateEnum
CREATE TYPE "NotificationChannelType" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE', 'APPROVE', 'REJECT', 'VERIFY', 'SCAN', 'ASSIGN', 'REVOKE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "specialty" TEXT,
    "clinic" TEXT,
    "city" TEXT,
    "avatarUrl" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "categoryId" UUID NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "registrationId" UUID,
    "enrollmentId" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "providerRef" TEXT,
    "receiptRef" TEXT,
    "verifiedById" UUID,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRTicket" (
    "id" UUID NOT NULL,
    "registrationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "QRTicketStatus" NOT NULL DEFAULT 'NOT_ISSUED',
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceCheckIn" (
    "id" UUID NOT NULL,
    "qrTicketId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "scannerId" UUID NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "scanTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "AttendanceCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructorId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "thumbnailUrl" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" UUID NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "videoId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'vps',
    "providerVideoId" TEXT,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "targetRoles" TEXT[],
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "entityType" TEXT,
    "entityId" TEXT,
    "channels" "NotificationChannelType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaticContentPage" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ContentPageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaticContentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "Role_slug_idx" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "Permission_module_action_idx" ON "Permission"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_action_key" ON "Permission"("module", "action");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_name_key" ON "EventCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_slug_key" ON "EventCategory"("slug");

-- CreateIndex
CREATE INDEX "EventCategory_slug_idx" ON "EventCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_categoryId_idx" ON "Event"("categoryId");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_status_idx" ON "EventRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_userId_eventId_key" ON "EventRegistration"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_registrationId_key" ON "Payment"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_enrollmentId_key" ON "Payment"("enrollmentId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_provider_idx" ON "Payment"("provider");

-- CreateIndex
CREATE INDEX "Payment_providerRef_idx" ON "Payment"("providerRef");

-- CreateIndex
CREATE UNIQUE INDEX "QRTicket_registrationId_key" ON "QRTicket"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "QRTicket_tokenHash_key" ON "QRTicket"("tokenHash");

-- CreateIndex
CREATE INDEX "QRTicket_tokenHash_idx" ON "QRTicket"("tokenHash");

-- CreateIndex
CREATE INDEX "QRTicket_eventId_idx" ON "QRTicket"("eventId");

-- CreateIndex
CREATE INDEX "QRTicket_status_idx" ON "QRTicket"("status");

-- CreateIndex
CREATE INDEX "AttendanceCheckIn_eventId_idx" ON "AttendanceCheckIn"("eventId");

-- CreateIndex
CREATE INDEX "AttendanceCheckIn_scannerId_idx" ON "AttendanceCheckIn"("scannerId");

-- CreateIndex
CREATE INDEX "AttendanceCheckIn_scanTime_idx" ON "AttendanceCheckIn"("scanTime");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCategory_name_key" ON "CourseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCategory_slug_key" ON "CourseCategory"("slug");

-- CreateIndex
CREATE INDEX "CourseCategory_slug_idx" ON "CourseCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");

-- CreateIndex
CREATE INDEX "Course_instructorId_idx" ON "Course"("instructorId");

-- CreateIndex
CREATE INDEX "Course_slug_idx" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_videoId_key" ON "Lesson"("videoId");

-- CreateIndex
CREATE INDEX "Lesson_courseId_idx" ON "Lesson"("courseId");

-- CreateIndex
CREATE INDEX "Lesson_orderIndex_idx" ON "Lesson"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_courseId_orderIndex_key" ON "Lesson"("courseId", "orderIndex");

-- CreateIndex
CREATE INDEX "CourseEnrollment_userId_idx" ON "CourseEnrollment"("userId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_idx" ON "CourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_status_idx" ON "CourseEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_userId_courseId_key" ON "CourseEnrollment"("userId", "courseId");

-- CreateIndex
CREATE INDEX "LessonProgress_enrollmentId_idx" ON "LessonProgress"("enrollmentId");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_enrollmentId_lessonId_key" ON "LessonProgress"("enrollmentId", "lessonId");

-- CreateIndex
CREATE INDEX "Announcement_status_idx" ON "Announcement"("status");

-- CreateIndex
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StaticContentPage_slug_key" ON "StaticContentPage"("slug");

-- CreateIndex
CREATE INDEX "StaticContentPage_slug_idx" ON "StaticContentPage"("slug");

-- CreateIndex
CREATE INDEX "StaticContentPage_status_idx" ON "StaticContentPage"("status");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRTicket" ADD CONSTRAINT "QRTicket_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRTicket" ADD CONSTRAINT "QRTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRTicket" ADD CONSTRAINT "QRTicket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCheckIn" ADD CONSTRAINT "AttendanceCheckIn_qrTicketId_fkey" FOREIGN KEY ("qrTicketId") REFERENCES "QRTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCheckIn" ADD CONSTRAINT "AttendanceCheckIn_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCheckIn" ADD CONSTRAINT "AttendanceCheckIn_scannerId_fkey" FOREIGN KEY ("scannerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CourseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
