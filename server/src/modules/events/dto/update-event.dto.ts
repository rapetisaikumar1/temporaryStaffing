import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

// clientId cannot be changed after creation
export class UpdateEventDto extends PartialType(
  OmitType(CreateEventDto, ['clientId'] as const),
) {}
