import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { CaseDiscussionsController } from './case-discussions.controller';
import { CaseDiscussionsService } from './case-discussions.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [CaseDiscussionsController],
  providers: [CaseDiscussionsService],
  exports: [CaseDiscussionsService],
})
export class CaseDiscussionsModule {}
