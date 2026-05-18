import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[\d\s\-()]{10,15}$/, { message: 'Enter a valid phone number' })
  phone: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Enter a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiProperty()
  @IsDateString({}, { message: 'Enter a valid event date' })
  eventDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  location: string;

  @ApiProperty()
  @IsInt()
  @Min(1, { message: 'Minimum 1 staff required' })
  staffCount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  staffRoles: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
