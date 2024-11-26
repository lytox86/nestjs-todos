import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class TaskUpdateDto {
  @ApiProperty({ example: 'Buy milk' })
  @IsString()
  @IsOptional()
  name?: string;
  @ApiProperty({ example: '1' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  priority?: number;
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  deadline?: Date;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
