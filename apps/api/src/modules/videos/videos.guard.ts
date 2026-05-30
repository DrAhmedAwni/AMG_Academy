import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class VideosGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    const videoId = request.params?.id;

    if (!userId || !videoId) {
      throw new ForbiddenException('Unauthorized');
    }

    const lesson = await this.prisma.lesson.findFirst({
      where: { videoId },
      include: {
        course: {
          select: {
            id: true,
            isFree: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Video lesson not found');
    }

    // Free courses: any authenticated user can watch
    if (lesson.course.isFree) {
      return true;
    }

    // Paid courses: must have active enrollment with verified payment
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.course.id } },
      include: { payment: true },
    });

    if (!enrollment || enrollment.status === 'CANCELLED') {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    const paymentSatisfied =
      !enrollment.payment ||
      enrollment.payment.status === 'SUCCESSFUL' ||
      enrollment.payment.status === 'MANUALLY_VERIFIED';

    if (!paymentSatisfied) {
      throw new ForbiddenException('Payment required to access this video');
    }

    return true;
  }
}
