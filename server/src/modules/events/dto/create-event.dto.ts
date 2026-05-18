import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Sharma Wedding Reception' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Wedding' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  type: string;

  @ApiProperty({ example: '2026-06-15', description: 'ISO date string (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '18:00' })
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:MM format' })
  startTime: string;

  @ApiProperty({ example: '23:00' })
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in HH:MM format' })
  endTime: string;

  @ApiProperty({ example: 'Taj Palace, New Delhi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  location: string;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5000)
  staffCount: number;

  @ApiProperty({ type: [String], example: ['Host', 'Usher', 'Security'] })
  @IsArray()
  @IsString({ each: true })
  staffRoles: string[];

  @ApiProperty({ example: 'clxxx123' })
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @ApiPropertyOptional({ example: 'clyyy456' })
  @IsOptional()
  @IsString()
  supervisorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
