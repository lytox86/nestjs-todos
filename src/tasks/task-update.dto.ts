import { ApiProperty } from '@nestjs/swagger';

export class TaskUpdateDto {
  @ApiProperty({ example: 'Buy milk' })
  name?: string;
  @ApiProperty({ example: '1' })
  priority?: number;
  @ApiProperty()
  deadline?: Date;
  @ApiProperty()
  completed?: boolean;
}
