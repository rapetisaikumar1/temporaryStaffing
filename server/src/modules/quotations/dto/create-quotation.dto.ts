import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuotationItemDto {
  @ApiProperty({ example: 'Host' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  role: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @IsPositive()
  ratePerPerson: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(365)
  days: number;
}

export class CreateQuotationDto {
  @ApiProperty({ example: 'Sharma Wedding — Staff Quotation' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'client-cuid' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ example: 'event-cuid' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ example: 'inquiry-cuid' })
  @IsOptional()
  @IsString()
  inquiryId?: string;

  @ApiProperty({ type: [QuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];

  @ApiPropertyOptional({ example: 500, description: 'Service charge flat amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceCharge?: number;

  @ApiPropertyOptional({ example: 18, description: 'Tax rate as percentage (e.g. 18 for 18%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({ example: 200, description: 'Flat discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
