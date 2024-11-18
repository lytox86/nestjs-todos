import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;
}
