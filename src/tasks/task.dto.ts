import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class TaskDto {
  @ApiProperty({ example: 'Buy milk' })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  priority: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  deadline: Date;
}
