import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CertificateSourceType as PrismaCertificateSourceType,
  CertificateStatus as PrismaCertificateStatus,
  CertificateTemplateScope,
  CertificateTemplateStatus,
  EnrollmentStatus,
  PaymentStatus,
  Prisma,
  QRTicketStatus,
  RegistrationStatus,
} from '@prisma/client';
import type {
  CertificateSourceType,
  CertificateStatus,
} from '@amg/shared';
import { randomBytes } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { mkdir, stat } from 'fs/promises';
import * as path from 'path';
import PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CertificateAdminFiltersDto,
  CertificateGenerateDto,
  CertificateInvalidationDto,
  CertificateReviewDto,
} from './dto/certificates.dto';

type CertificateWithRelations = Prisma.CertificateGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } };
    reviewedBy: { select: { id: true; name: true } };
  };
}>;

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);
  private readonly certificateDir = path.resolve(process.cwd(), 'uploads', 'certificates');

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findMine(userId: string, query: { page?: number; limit?: number } = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.CertificateWhereInput = {
      userId,
      status: PrismaCertificateStatus.RELEASED,
    };

    const [certificates, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ releasedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.certificate.count({ where }),
    ]);

    return {
      data: certificates.map((certificate) => this.mapWalletCertificate(certificate)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: CertificateAdminFiltersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;
    const where: Prisma.CertificateWhereInput = {};

    const status = this.toPrismaCertificateStatus(query.status);
    if (status) where.status = status;

    const sourceType = this.toPrismaCertificateSourceType(query.sourceType);
    if (sourceType) where.sourceType = sourceType;

    if (query.search) {
      where.OR = [
        { certificateNumber: { contains: query.search, mode: 'insensitive' } },
        { learnerName: { contains: query.search, mode: 'insensitive' } },
        { sourceTitle: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [certificates, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.certificate.count({ where }),
    ]);

    return {
      data: certificates.map((certificate) => this.mapAdminCertificate(certificate)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async verify(verificationCode: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { verificationCode },
    });

    if (!certificate || certificate.status !== PrismaCertificateStatus.RELEASED) {
      return this.invalidVerification(certificate?.status);
    }

    return {
      valid: true,
      certificateNumber: certificate.certificateNumber,
      learnerName: certificate.learnerName,
      sourceType: certificate.sourceType.toLowerCase(),
      sourceTitle: certificate.sourceTitle,
      issuerName: certificate.issuerName,
      issuedAt: certificate.issuedAt?.toISOString() ?? null,
      hours: this.toNumberOrNull(certificate.hours),
      credits: this.toNumberOrNull(certificate.credits),
      status: certificate.status.toLowerCase(),
    };
  }

  async release(id: string, adminId: string, input: CertificateReviewDto) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.status === PrismaCertificateStatus.RELEASED) {
      return this.mapAdminCertificate(certificate);
    }

    if (certificate.status === PrismaCertificateStatus.REVOKED || certificate.status === PrismaCertificateStatus.VOIDED) {
      throw new BadRequestException('Invalid certificates cannot be released');
    }

    const issuedAt = certificate.issuedAt ?? new Date();
    const pdfStorageKey = await this.generatePdfFile({ ...certificate, issuedAt });

    const updated = await this.prisma.certificate.update({
      where: { id },
      data: {
        status: PrismaCertificateStatus.RELEASED,
        issuedAt,
        releasedAt: new Date(),
        reviewedById: adminId,
        reviewNotes: input.reviewNotes,
        invalidReason: null,
        pdfStorageProvider: 'local',
        pdfStorageKey,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    return this.mapAdminCertificate(updated);
  }

  async revoke(id: string, adminId: string, input: CertificateInvalidationDto) {
    return this.invalidate(id, adminId, PrismaCertificateStatus.REVOKED, input.reason);
  }

  async void(id: string, adminId: string, input: CertificateInvalidationDto) {
    return this.invalidate(id, adminId, PrismaCertificateStatus.VOIDED, input.reason);
  }

  async generateForAdmin(input: CertificateGenerateDto) {
    if (input.sourceType === 'event') {
      return this.ensureForEventAttendance(input.userId, input.eventId!, { allowRepair: true });
    }

    return this.ensureForCourseCompletionByUser(input.userId, input.courseId!, { allowRepair: true });
  }

  async ensureForEventAttendance(
    userId: string,
    eventId: string,
    options: { allowRepair?: boolean } = {},
  ) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } },
      include: {
        user: true,
        event: true,
        payment: true,
        qrTicket: { include: { attendance: true } },
      },
    });

    if (!registration || registration.status !== RegistrationStatus.APPROVED) {
      return null;
    }

    const paymentSatisfied = this.isPaymentSatisfied(Number(registration.event.price), registration.payment?.status);
    const attended =
      registration.qrTicket?.status === QRTicketStatus.USED ||
      registration.qrTicket?.attendance.some((record) => record.status === 'VALIDATED');

    if (!paymentSatisfied || !attended) {
      return null;
    }

    const hours = this.calculateHours(registration.event.startDate, registration.event.endDate);

    return this.createOrUpdatePendingCertificate({
      userId,
      sourceType: PrismaCertificateSourceType.EVENT,
      sourceId: eventId,
      eventId,
      courseId: null,
      learnerName: registration.user.name,
      sourceTitle: registration.event.title,
      hours,
      credits: null,
      allowRepair: options.allowRepair,
    });
  }

  async ensureForCourseCompletion(enrollmentId: string) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: { include: { lessons: true } },
        payment: true,
        progress: true,
      },
    });

    if (!enrollment) {
      return null;
    }

    return this.ensureCourseEnrollmentCertificate(enrollment);
  }

  async ensureForCourseCompletionByUser(
    userId: string,
    courseId: string,
    options: { allowRepair?: boolean } = {},
  ) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        user: true,
        course: { include: { lessons: true } },
        payment: true,
        progress: true,
      },
    });

    if (!enrollment) {
      return null;
    }

    return this.ensureCourseEnrollmentCertificate(enrollment, options);
  }

  async sendDownloadById(
    id: string,
    user: { sub: string; permissions?: string[] },
    response: Response,
  ) {
    const certificate = await this.prisma.certificate.findUnique({ where: { id } });
    if (!certificate) throw new NotFoundException('Certificate not found');

    const isAdmin = user.permissions?.includes('*:*') || user.permissions?.includes('certificates:read');
    if (!isAdmin && certificate.userId !== user.sub) {
      throw new ForbiddenException('You cannot download this certificate');
    }

    if (certificate.status !== PrismaCertificateStatus.RELEASED) {
      throw new ForbiddenException('Certificate is not released');
    }

    await this.sendCertificatePdf(certificate, response);
  }

  async sendDownloadByVerificationCode(verificationCode: string, response: Response) {
    const certificate = await this.prisma.certificate.findUnique({ where: { verificationCode } });
    if (!certificate || certificate.status !== PrismaCertificateStatus.RELEASED) {
      throw new NotFoundException('Certificate not found');
    }

    await this.sendCertificatePdf(certificate, response);
  }

  private async ensureCourseEnrollmentCertificate(
    enrollment: Prisma.CourseEnrollmentGetPayload<{
      include: {
        user: true;
        course: { include: { lessons: true } };
        payment: true;
        progress: true;
      };
    }>,
    options: { allowRepair?: boolean } = {},
  ) {
    if (enrollment.status !== EnrollmentStatus.COMPLETED || enrollment.course.status !== 'PUBLISHED') {
      return null;
    }

    const completedLessons = enrollment.progress.filter((progress) => progress.isCompleted).length;
    const totalLessons = enrollment.course.lessons.length;
    if (totalLessons === 0 || completedLessons < totalLessons) {
      return null;
    }

    if (!this.isPaymentSatisfied(Number(enrollment.course.price), enrollment.payment?.status)) {
      return null;
    }

    return this.createOrUpdatePendingCertificate({
      userId: enrollment.userId,
      sourceType: PrismaCertificateSourceType.COURSE,
      sourceId: enrollment.courseId,
      eventId: null,
      courseId: enrollment.courseId,
      learnerName: enrollment.user.name,
      sourceTitle: enrollment.course.title,
      hours: enrollment.course.totalDuration > 0 ? enrollment.course.totalDuration / 60 : null,
      credits: null,
      allowRepair: options.allowRepair,
    });
  }

  private async createOrUpdatePendingCertificate(input: {
    userId: string;
    sourceType: PrismaCertificateSourceType;
    sourceId: string;
    eventId: string | null;
    courseId: string | null;
    learnerName: string;
    sourceTitle: string;
    hours: number | null;
    credits: number | null;
    allowRepair?: boolean;
  }) {
    const existing = await this.prisma.certificate.findUnique({
      where: {
        userId_sourceType_sourceId: {
          userId: input.userId,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    if (existing) {
      if (existing.status === PrismaCertificateStatus.RELEASED) {
        return this.mapAdminCertificate(existing);
      }

      if (
        !input.allowRepair &&
        (existing.status === PrismaCertificateStatus.REVOKED || existing.status === PrismaCertificateStatus.VOIDED)
      ) {
        return this.mapAdminCertificate(existing);
      }

      const updated = await this.prisma.certificate.update({
        where: { id: existing.id },
        data: {
          status: PrismaCertificateStatus.PENDING_REVIEW,
          learnerName: input.learnerName,
          sourceTitle: input.sourceTitle,
          eventId: input.eventId,
          courseId: input.courseId,
          hours: input.hours,
          credits: input.credits,
          invalidReason: null,
          reviewedById: null,
          reviewNotes: null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
      });

      return this.mapAdminCertificate(updated);
    }

    const template = await this.ensureDefaultTemplate(input.sourceType);
    const created = await this.prisma.certificate.create({
      data: {
        certificateNumber: await this.generateCertificateNumber(),
        verificationCode: this.generateVerificationCode(),
        userId: input.userId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        eventId: input.eventId,
        courseId: input.courseId,
        templateId: template.id,
        status: PrismaCertificateStatus.PENDING_REVIEW,
        learnerName: input.learnerName,
        sourceTitle: input.sourceTitle,
        hours: input.hours,
        credits: input.credits,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    return this.mapAdminCertificate(created);
  }

  private async invalidate(
    id: string,
    adminId: string,
    status: PrismaCertificateStatus,
    reason: string,
  ) {
    const existing = await this.prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Certificate not found');
    }

    const updated = await this.prisma.certificate.update({
      where: { id },
      data: {
        status,
        reviewedById: adminId,
        invalidReason: reason,
        revokedAt: status === PrismaCertificateStatus.REVOKED ? new Date() : existing.revokedAt,
        voidedAt: status === PrismaCertificateStatus.VOIDED ? new Date() : existing.voidedAt,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    return this.mapAdminCertificate(updated);
  }

  private async ensureDefaultTemplate(sourceType: PrismaCertificateSourceType) {
    const scope = sourceType === PrismaCertificateSourceType.EVENT
      ? CertificateTemplateScope.EVENT
      : CertificateTemplateScope.COURSE;
    const existing = await this.prisma.certificateTemplate.findFirst({
      where: {
        status: CertificateTemplateStatus.ACTIVE,
        isDefault: true,
        scope: { in: [scope, CertificateTemplateScope.BOTH] },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (existing) return existing;

    return this.prisma.certificateTemplate.create({
      data: {
        name: 'AMG Academy Default Certificate',
        scope: CertificateTemplateScope.BOTH,
        status: CertificateTemplateStatus.ACTIVE,
        isDefault: true,
        layoutConfig: {
          primaryColor: '#0891B2',
          accentColor: '#54D9E8',
          backgroundColor: '#FFFFFF',
          textColor: '#111827',
        },
      },
    });
  }

  private async generateCertificateNumber() {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `AMG-CERT-${year}-${randomBytes(4).toString('hex').toUpperCase()}`;
      const existing = await this.prisma.certificate.findUnique({
        where: { certificateNumber: candidate },
        select: { id: true },
      });
      if (!existing) return candidate;
    }

    return `AMG-CERT-${year}-${Date.now()}`;
  }

  private generateVerificationCode() {
    return randomBytes(24).toString('base64url');
  }

  private getFrontendUrl() {
    return this.config.get<string>('app.frontendUrl', 'http://localhost:3000').replace(/\/$/, '');
  }

  private getVerificationUrl(certificate: { verificationCode: string }) {
    return `${this.getFrontendUrl()}/certificates/verify/${certificate.verificationCode}`;
  }

  private getDownloadUrl(certificate: { id: string }) {
    return `/api/v1/certificates/${certificate.id}/download`;
  }

  private getPublicDownloadUrl(certificate: { verificationCode: string }) {
    return `/api/v1/certificates/verify/${certificate.verificationCode}/download`;
  }

  private async generatePdfFile(
    certificate: Prisma.CertificateGetPayload<{}> & { issuedAt: Date },
  ) {
    await mkdir(this.certificateDir, { recursive: true });
    const pdfPath = path.join(this.certificateDir, `${certificate.id}.pdf`);
    const verificationUrl = this.getVerificationUrl(certificate);
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 180,
    });
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1] ?? '', 'base64');

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 56,
      });
      const stream = createWriteStream(pdfPath);
      stream.on('finish', resolve);
      stream.on('error', reject);
      doc.on('error', reject);
      doc.pipe(stream);

      doc
        .rect(28, 28, doc.page.width - 56, doc.page.height - 56)
        .lineWidth(2)
        .strokeColor('#54D9E8')
        .stroke();

      doc
        .fontSize(18)
        .fillColor('#0F172A')
        .text('AMG Academy', { align: 'center' });
      doc.moveDown(0.6);
      doc
        .fontSize(34)
        .fillColor('#111827')
        .text('Certificate of Completion', { align: 'center' });
      doc.moveDown(1.1);
      doc
        .fontSize(14)
        .fillColor('#4B5563')
        .text('This certificate is proudly presented to', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(30)
        .fillColor('#0891B2')
        .text(certificate.learnerName, { align: 'center' });
      doc.moveDown(0.7);
      doc
        .fontSize(15)
        .fillColor('#374151')
        .text('for successfully completing', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(22)
        .fillColor('#111827')
        .text(certificate.sourceTitle, { align: 'center' });

      const detailParts = [
        `Certificate ID: ${certificate.certificateNumber}`,
        `Issued: ${certificate.issuedAt.toISOString().slice(0, 10)}`,
      ];
      const hours = this.toNumberOrNull(certificate.hours);
      const credits = this.toNumberOrNull(certificate.credits);
      if (hours) detailParts.push(`Hours: ${hours}`);
      if (credits) detailParts.push(`Credits: ${credits}`);

      doc.moveDown(1.4);
      doc
        .fontSize(12)
        .fillColor('#4B5563')
        .text(detailParts.join('   |   '), { align: 'center' });

      doc.image(qrBuffer, doc.page.width - 170, doc.page.height - 178, { width: 92 });
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text('Scan to verify', doc.page.width - 178, doc.page.height - 78, {
          width: 110,
          align: 'center',
        });

      doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text(certificate.issuerName, 56, doc.page.height - 86, { width: 220 });
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text(verificationUrl, 56, doc.page.height - 68, { width: doc.page.width - 230 });

      doc.end();
    });

    return pdfPath;
  }

  private async ensurePdfPath(certificate: Prisma.CertificateGetPayload<{}>) {
    if (certificate.pdfStorageKey) {
      try {
        await stat(certificate.pdfStorageKey);
        return certificate.pdfStorageKey;
      } catch {
        this.logger.warn(`Missing certificate PDF for ${certificate.id}; regenerating`);
      }
    }

    if (certificate.status !== PrismaCertificateStatus.RELEASED || !certificate.issuedAt) {
      throw new BadRequestException('Certificate PDF is not available');
    }

    const pdfStorageKey = await this.generatePdfFile({
      ...certificate,
      issuedAt: certificate.issuedAt,
    });
    await this.prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        pdfStorageProvider: 'local',
        pdfStorageKey,
      },
    });
    return pdfStorageKey;
  }

  private async sendCertificatePdf(
    certificate: Prisma.CertificateGetPayload<{}>,
    response: Response,
  ) {
    const pdfPath = await this.ensurePdfPath(certificate);
    const fileName = `${certificate.certificateNumber}.pdf`;
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    createReadStream(pdfPath).pipe(response);
  }

  private invalidVerification(status?: PrismaCertificateStatus) {
    return {
      valid: false,
      certificateNumber: null,
      learnerName: null,
      sourceType: null,
      sourceTitle: null,
      issuerName: 'AMG Academy',
      issuedAt: null,
      hours: null,
      credits: null,
      status: status ? status.toLowerCase() : 'not_found',
    };
  }

  private mapWalletCertificate(certificate: CertificateWithRelations) {
    return {
      id: certificate.id,
      certificateNumber: certificate.certificateNumber,
      sourceType: certificate.sourceType.toLowerCase(),
      sourceTitle: certificate.sourceTitle,
      learnerName: certificate.learnerName,
      issuerName: certificate.issuerName,
      status: certificate.status.toLowerCase(),
      issuedAt: certificate.issuedAt?.toISOString() ?? null,
      releasedAt: certificate.releasedAt?.toISOString() ?? null,
      hours: this.toNumberOrNull(certificate.hours),
      credits: this.toNumberOrNull(certificate.credits),
      verificationUrl: this.getVerificationUrl(certificate),
      downloadUrl: this.getDownloadUrl(certificate),
      publicDownloadUrl: this.getPublicDownloadUrl(certificate),
    };
  }

  private mapAdminCertificate(certificate: CertificateWithRelations) {
    return {
      ...this.mapWalletCertificate(certificate),
      user: certificate.user,
      reviewedBy: certificate.reviewedBy,
      reviewNotes: certificate.reviewNotes,
      invalidReason: certificate.invalidReason,
      createdAt: certificate.createdAt.toISOString(),
      revokedAt: certificate.revokedAt?.toISOString() ?? null,
      voidedAt: certificate.voidedAt?.toISOString() ?? null,
    };
  }

  private toNumberOrNull(value: Prisma.Decimal | null) {
    return value === null ? null : Number(value);
  }

  private calculateHours(startDate: Date, endDate: Date) {
    const diff = Math.max(0, endDate.getTime() - startDate.getTime());
    return Math.round(diff / 3_600_000);
  }

  private isPaymentSatisfied(price: number, status?: PaymentStatus | null) {
    return (
      price <= 0 ||
      status === PaymentStatus.SUCCESSFUL ||
      status === PaymentStatus.MANUALLY_VERIFIED ||
      status === PaymentStatus.NOT_REQUIRED
    );
  }

  private toPrismaCertificateStatus(value?: string) {
    if (!value) return undefined;
    const normalized = value.toUpperCase();
    if (normalized === 'PENDING_REVIEW') return PrismaCertificateStatus.PENDING_REVIEW;
    if (normalized === 'RELEASED') return PrismaCertificateStatus.RELEASED;
    if (normalized === 'REVOKED') return PrismaCertificateStatus.REVOKED;
    if (normalized === 'VOIDED') return PrismaCertificateStatus.VOIDED;
    return undefined;
  }

  private toPrismaCertificateSourceType(value?: string) {
    if (!value) return undefined;
    const normalized = value.toUpperCase();
    if (normalized === 'EVENT') return PrismaCertificateSourceType.EVENT;
    if (normalized === 'COURSE') return PrismaCertificateSourceType.COURSE;
    return undefined;
  }
}
