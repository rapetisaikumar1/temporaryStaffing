import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@niyukti.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @IsNotEmpty()
  email: string;
}
