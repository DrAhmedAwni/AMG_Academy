import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [PrismaModule, CertificatesModule, NotificationsModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
