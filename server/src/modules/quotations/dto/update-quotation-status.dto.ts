import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuotationStatus } from '@prisma/client';

export class UpdateQuotationStatusDto {
  @ApiProperty({ enum: QuotationStatus })
  @IsEnum(QuotationStatus)
  status: QuotationStatus;
}
