import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationTriggers {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async registrationSubmitted(userId: string, eventTitle: string, registrationId: string) {
    await this.notificationService.send({
      userId,
      type: 'REGISTRATION_SUBMITTED' as any,
      title: 'Registration Submitted',
      message: `Your registration for ${eventTitle} has been submitted and is pending approval.`,
      entityType: 'EventRegistration',
      entityId: registrationId,
    }, ['in_app', 'email']);
  }

  async registrationApproved(userId: string, eventTitle: string, registrationId: string) {
    await this.notificationService.send({
      userId,
      type: 'REGISTRATION_APPROVED' as any,
      title: 'Registration Approved',
      message: `Your registration for ${eventTitle} has been approved.`,
      entityType: 'EventRegistration',
      entityId: registrationId,
    }, ['in_app', 'email']);
  }

  async registrationRejected(userId: string, eventTitle: string, registrationId: string, reason?: string) {
    await this.notificationService.send({
      userId,
      type: 'REGISTRATION_REJECTED' as any,
      title: 'Registration Rejected',
      message: `Your registration for ${eventTitle} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      entityType: 'EventRegistration',
      entityId: registrationId,
    }, ['in_app', 'email']);
  }

  async paymentSuccessful(userId: string, amount: number, currency: string, paymentId: string) {
    await this.notificationService.send({
      userId,
      type: 'PAYMENT_SUCCESSFUL' as any,
      title: 'Payment Successful',
      message: `Your payment of ${amount} ${currency} has been verified.`,
      entityType: 'Payment',
      entityId: paymentId,
    }, ['in_app', 'email']);
  }

  async qrIssued(userId: string, eventTitle: string, ticketId: string) {
    await this.notificationService.send({
      userId,
      type: 'QR_ISSUED' as any,
      title: 'QR Ticket Issued',
      message: `Your QR ticket for ${eventTitle} is ready. Show it at the entrance.`,
      entityType: 'QRTicket',
      entityId: ticketId,
    }, ['in_app', 'email']);
  }

  async newCoursePublished(userId: string, courseTitle: string, courseId: string) {
    await this.notificationService.send({
      userId,
      type: 'NEW_COURSE_PUBLISHED' as any,
      title: 'New Course Available',
      message: `A new course "${courseTitle}" has been published. Enroll now!`,
      entityType: 'Course',
      entityId: courseId,
    }, ['in_app', 'email']);
  }

  async newEnrollment(userId: string, courseTitle: string, enrollmentId: string) {
    await this.notificationService.send({
      userId,
      type: 'REGISTRATION_SUBMITTED' as any,
      title: 'Enrollment Confirmed',
      message: `You have successfully enrolled in ${courseTitle}.`,
      entityType: 'CourseEnrollment',
      entityId: enrollmentId,
    }, ['in_app', 'email']);
  }
}
