import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @IsNotEmpty()
  @ApiProperty({ example: '1' })
  @IsInt()
  @IsPositive()
  userId: number;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
