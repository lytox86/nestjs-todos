import {
  IsBooleanString,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindTasksQueryDto {
  @IsString()
  @IsOptional()
  name?: string;
  @IsOptional()
  @IsBooleanString()
  completed?: boolean;
  @IsNumberString()
  @IsOptional()
  priority?: number;
  @IsIn(['created', 'deadline', 'name', 'priority'])
  @IsOptional()
  sortBy?: 'name' | 'deadline' | 'priority' | 'created';
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC';
  @IsNumberString()
  @IsOptional()
  page?: number;
}
