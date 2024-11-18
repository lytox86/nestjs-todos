import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TaskDto {
  @ApiProperty({ example: 'Buy milk' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  priority: number;
  @ApiProperty()
  @IsNotEmpty()
  deadline: Date;
}
