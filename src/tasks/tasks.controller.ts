import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/authenticated.guard';
import { UserId } from '../users/user.decorator';
import { TaskUpdateDto } from './task-update.dto';
import { TaskDto } from './task.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FindTasksQueryDto } from '../users/find-tasks-query.dto';

@Controller({ version: '1', path: 'tasks' })
@UseGuards(JwtAuthGuard) // Ensure that only authenticated users can access this controller
@ApiBearerAuth('access-token')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'completed', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'deadline', 'priority', 'created'],
  })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false })
  async findUserTasks(
    @UserId() userId: number,
    @Query() query: FindTasksQueryDto,
    // @Query('name') name?: string,
    // @Query('completed') completed?: boolean,
    // @Query('priority') priority?: number,
    // @IsIn(['created', 'deadline', 'name', 'priority'])
    // @Query('sortBy')
    // sortBy?: 'name' | 'deadline' | 'priority' | 'created',
    // @IsIn(['ASC', 'DESC']) @Query('order') order?: 'ASC' | 'DESC',
    // @Query('page') page?: number = 1,
  ) {
    const tasks = await this.tasksService.findUserTasks(
      userId,
      {
        name: query.name,
        completed: query.completed,
        priority: query.priority,
        sortBy: query.sortBy,
        order: query.order,
      },
      query.page || 1,
    );
    // const validSortByFields = ['created', 'deadline', 'name', 'priority'];
    // if (sortBy !== undefined) {
    //   // Ensure that sortBy is one of the valid columns
    //   if (!validSortByFields.includes(sortBy)) {
    //     throw new BadRequestException();
    //   }
    // }
    // const validOrderValues = ['ASC', 'DESC'];
    // if (order !== undefined) {
    //   // Ensure that sortBy is one of the valid columns
    //   if (!validOrderValues.includes(order)) {
    //     throw new BadRequestException();
    //   }
    // }
    return tasks.map((task) => task.toResponseObject());
  }

  @Get(':id')
  async getTask(@UserId() userId: number, @Param('id') taskId: number) {
    const task = await this.tasksService.getUserTaskById(taskId, userId);
    if (!task) {
      throw new NotFoundException();
    }
    return task.toResponseObject();
  }

  @Post()
  async createTask(@UserId() userId: number, @Body() task: TaskDto) {
    const newTask = await this.tasksService.createTask(task, userId);
    return newTask.toResponseObject();
  }

  @Patch(':id')
  async updateTask(
    @UserId() userId: number,
    @Param('id') taskId: number,
    @Body() taskUpdateDto: TaskUpdateDto,
  ) {
    const updatedTask = await this.tasksService.updateTask(
      taskId,
      taskUpdateDto,
      userId,
    );
    if (!updatedTask) {
      throw new NotFoundException();
    }
    return updatedTask.toResponseObject();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteTask(@UserId() userId: number, @Param('id') taskId: number) {
    await this.tasksService.deleteTask(taskId, userId);
  }
}
