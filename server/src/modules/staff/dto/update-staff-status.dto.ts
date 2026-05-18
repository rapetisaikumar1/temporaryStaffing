import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StaffStatus } from '@prisma/client';

export class UpdateStaffStatusDto {
  @ApiProperty({ enum: StaffStatus })
  @IsEnum(StaffStatus)
  status: StaffStatus;
}
