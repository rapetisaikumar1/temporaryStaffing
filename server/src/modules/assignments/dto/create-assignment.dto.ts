import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'event-cuid' })
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @ApiProperty({ example: 'staff-cuid' })
  @IsNotEmpty()
  @IsString()
  staffId: string;

  @ApiProperty({ example: 'Host' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  role: string;

  @ApiPropertyOptional({ example: 'Handle VIP table greeting' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
