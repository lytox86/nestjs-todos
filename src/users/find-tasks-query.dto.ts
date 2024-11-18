import { IsIn } from 'class-validator';

export class FindTasksQueryDto {
  name?: string;
  completed?: boolean;
  priority?: number;
  @IsIn(['created', 'deadline', 'name', 'priority', undefined])
  sortBy?: 'name' | 'deadline' | 'priority' | 'created';
  @IsIn(['ASC', 'DESC', undefined])
  order?: 'ASC' | 'DESC';
  page?: number = 1;
}
