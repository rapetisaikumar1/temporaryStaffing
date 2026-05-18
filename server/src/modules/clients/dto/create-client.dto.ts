import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Sharma Events Pvt Ltd' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  companyName?: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' })
  phone: string;

  @ApiProperty({ example: 'rahul@sharmaevents.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @ApiPropertyOptional({ example: '12 MG Road, Bengaluru, Karnataka 560001' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
