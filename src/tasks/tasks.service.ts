import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { PAGE_SIZE } from '../constants';
import { TaskUpdateDto } from './task-update.dto';
import { TaskDto } from './task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}
  // TODO define converters between API DTOs and DB entities

  async findUserTasks(
    userId: number,
    filters: {
      name?: string;
      completed?: boolean;
      priority?: number;
      sortBy?: string;
      order?: 'ASC' | 'DESC';
    },
    page: number,
  ) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    // Filter tasks by user ID
    queryBuilder.where('task.userId = :userId', { userId });

    // Apply filters
    if (filters.name !== undefined) {
      queryBuilder.andWhere('task.name = :name', { name: filters.name });
    }

    if (filters.completed !== undefined) {
      queryBuilder.andWhere('task.completed = :completed', {
        completed: filters.completed,
      });
    }

    if (filters.priority !== undefined) {
      queryBuilder.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }

    // Apply sorting
    if (filters.sortBy !== undefined) {
      queryBuilder.orderBy(`task.${filters.sortBy}`, filters.order || 'ASC');
    } else {
      // Default sorting by created date if no sorting is provided
      queryBuilder.orderBy('task.created', filters.order || 'ASC');
    }

    queryBuilder.skip(PAGE_SIZE * (page - 1)).take(PAGE_SIZE);

    // Execute the query
    return queryBuilder.getMany();
  }

  createTask(task: TaskDto, userId: number) {
    const taskEntity = this.taskRepository.create({
      ...task,
      created: new Date(),
      userId,
    });

    return this.taskRepository.save(taskEntity);
  }

  getUserTaskById(taskId: number, userId: number) {
    return this.taskRepository.findOneBy({
      id: taskId,
      userId,
    });
  }

  async updateTask(
    taskId: number,
    taskUpdateDto: TaskUpdateDto,
    userId: number,
  ) {
    const updateResult = await this.taskRepository.update(
      {
        id: taskId,
        userId,
      },
      taskUpdateDto,
    );
    if (updateResult.affected !== 1) {
      return null;
    } else {
      return this.taskRepository.findOneBy({ id: taskId });
    }
  }

  async deleteTask(taskId: number, userId: number): Promise<boolean> {
    const updateResult = await this.taskRepository.delete({
      id: taskId,
      userId,
    });
    return updateResult.affected === 1;
  }
}
