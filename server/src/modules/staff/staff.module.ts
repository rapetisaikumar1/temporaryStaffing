import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffDocumentsService } from './staff-documents.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, UploadsModule],
  controllers: [StaffController],
  providers: [StaffService, StaffDocumentsService],
  exports: [StaffService],
})
export class StaffModule {}
