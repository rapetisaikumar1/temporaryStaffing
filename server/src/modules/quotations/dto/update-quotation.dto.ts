import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QuotationItemDto } from './create-quotation.dto';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateQuotationDto } from './create-quotation.dto';

class PartialCreateQuotationDto extends PartialType(
  OmitType(CreateQuotationDto, ['items'] as const),
) {}

export class UpdateQuotationDto extends PartialCreateQuotationDto {
  @ApiPropertyOptional({ type: [QuotationItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];
}
