import { IsString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const DOCUMENT_TYPES = ['ID_PROOF', 'PHOTO', 'CERTIFICATE', 'CONTRACT', 'OTHER'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export class UploadDocumentDto {
  @ApiProperty({
    enum: DOCUMENT_TYPES,
    description: 'Type of document being uploaded',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(DOCUMENT_TYPES)
  type: DocumentType;
}
