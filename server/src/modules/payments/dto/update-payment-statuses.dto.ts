import { IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus, PaymentStatus, StaffPayoutStatus } from '@prisma/client';

export class UpdatePaymentStatusesDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  invoiceStatus?: InvoiceStatus;

  @IsOptional()
  @IsEnum(StaffPayoutStatus)
  staffPayoutStatus?: StaffPayoutStatus;
}
