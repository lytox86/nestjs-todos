import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @IsNotEmpty()
  @ApiProperty({ example: '1' })
  userId: number;

  @IsNotEmpty()
  @ApiProperty()
  refreshToken: string;
}
