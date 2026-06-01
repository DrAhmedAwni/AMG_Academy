import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { QrScanController, QrTicketsController } from './qr-tickets.controller';
import { QrTicketsService } from './qr-tickets.service';

@Module({
  imports: [PrismaModule, CertificatesModule, NotificationsModule],
  controllers: [QrTicketsController, QrScanController],
  providers: [QrTicketsService],
  exports: [QrTicketsService],
})
export class QrTicketsModule {}
