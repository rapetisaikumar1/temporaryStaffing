import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  advancePaid?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
