import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { ClientsModule } from './modules/clients/clients.module';
import { StaffModule } from './modules/staff/staff.module';
import { EventsModule } from './modules/events/events.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import cloudinaryConfig from './config/cloudinary.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, cloudinaryConfig],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    InquiriesModule,
    ClientsModule,
    StaffModule,
    EventsModule,
    AssignmentsModule,
    QuotationsModule,
    AttendanceModule,
    PaymentsModule,
    ReportsModule,
    UploadsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
