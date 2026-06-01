import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StudyGroupFilesController } from './study-group-files.controller';
import { StudyGroupsController } from './study-groups.controller';
import { StudyGroupsGateway } from './study-groups.gateway';
import { StudyGroupsService } from './study-groups.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [StudyGroupsController, StudyGroupFilesController],
  providers: [StudyGroupsService, StudyGroupsGateway],
  exports: [StudyGroupsService],
})
export class StudyGroupsModule {}
