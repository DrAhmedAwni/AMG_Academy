import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QrScanController, QrTicketsController } from './qr-tickets.controller';
import { QrTicketsService } from './qr-tickets.service';

@Module({
  imports: [PrismaModule],
  controllers: [QrTicketsController, QrScanController],
  providers: [QrTicketsService],
  exports: [QrTicketsService],
})
export class QrTicketsModule {}
