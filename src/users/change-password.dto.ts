import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  newPassword: string;
}
