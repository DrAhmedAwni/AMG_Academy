import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import queuesConfig from './config/queues.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CacheModule } from './common/cache/cache.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { throttlerDefinitions } from './common/guards/throttler.config';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { AuthModule } from './modules/auth/auth.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { EventCategoriesModule } from './modules/event-categories/event-categories.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { QrTicketsModule } from './modules/qr-tickets/qr-tickets.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CourseCategoriesModule } from './modules/course-categories/course-categories.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { VideosModule } from './modules/videos/videos.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ExportsModule } from './modules/exports/exports.module';
import { ContentPagesModule } from './modules/content-pages/content-pages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailChannel } from './modules/notifications/channels/email.channel';
import { InAppChannel } from './modules/notifications/channels/in-app.channel';
import { CaseDiscussionsModule } from './modules/case-discussions/case-discussions.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { StudyGroupsModule } from './modules/study-groups/study-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig, authConfig, queuesConfig],
    }),
    CacheModule,
    ThrottlerModule.forRoot(throttlerDefinitions),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuditLogsModule,
    AnnouncementsModule,
    EventsModule,
    EventCategoriesModule,
    RegistrationsModule,
    PaymentsModule,
    QrTicketsModule,
    AttendanceModule,
    CoursesModule,
    CourseCategoriesModule,
    LessonsModule,
    VideosModule,
    EnrollmentsModule,
    ReportsModule,
    ExportsModule,
    ContentPagesModule,
    NotificationsModule,
    CaseDiscussionsModule,
    CertificatesModule,
    StudyGroupsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    InAppChannel,
    EmailChannel,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
