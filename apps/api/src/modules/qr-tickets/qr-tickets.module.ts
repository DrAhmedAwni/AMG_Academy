import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { QrScanController, QrTicketsController } from './qr-tickets.controller';
import { QrTicketsService } from './qr-tickets.service';

@Module({
  imports: [PrismaModule, CertificatesModule],
  controllers: [QrTicketsController, QrScanController],
  providers: [QrTicketsService],
  exports: [QrTicketsService],
})
export class QrTicketsModule {}
