import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
