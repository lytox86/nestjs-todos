import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: Partial<TasksService>;

  beforeEach(async () => {
    const task1 = new Task();
    task1.id = 1;
    task1.name = 'task1';
    task1.completed = true;
    task1.priority = 1;
    task1.created = new Date();
    task1.deadline = new Date();
    const task2 = new Task();
    task2.id = 1;
    task2.name = 'task2';
    task2.completed = false;
    task2.priority = 1;
    task2.created = new Date();
    task2.deadline = new Date();
    tasksService = {
      findUserTasks: jest.fn().mockResolvedValue([task1, task2]),
      createTask: jest.fn().mockResolvedValue(task1),
      updateTask: jest.fn().mockResolvedValue(task1),
      getUserTaskById: jest.fn().mockResolvedValue(task1),
      deleteTask: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksService }],
    }).compile();

    tasksController = module.get<TasksController>(TasksController);
  });

  it('should fetch tasks for a user', async () => {
    const tasks = await tasksController.findUserTasks(2, {});
    expect(tasks).toHaveLength(2);
    expect(tasksService.findUserTasks).toHaveBeenCalledWith(
      2,
      {
        completed: undefined,
        name: undefined,
        order: undefined,
        priority: undefined,
        sortBy: undefined,
      },
      1,
    );
  });

  it('should create a new task', async () => {
    const task = await tasksController.createTask(2, {
      name: 'New Task',
      deadline: new Date(),
      priority: 0,
    });
    expect(task).toHaveProperty('name');
    expect(tasksService.createTask).toHaveBeenCalledTimes(1);
  });

  it('should update a task', async () => {
    const task = await tasksController.updateTask(1, 2, {
      name: 'Updated Task',
    });
    expect(task).toHaveProperty('name');
    expect(tasksService.updateTask).toHaveBeenCalledWith(
      2,
      { name: 'Updated Task' },
      1,
    );
  });

  it('should delete a task', async () => {
    await tasksController.deleteTask(1, 2);
    expect(tasksService.deleteTask).toHaveBeenCalledWith(2, 1);
  });

  it('should throw an error if service layer throws', async () => {
    jest
      .spyOn(tasksService, 'deleteTask')
      .mockRejectedValue(new Error('Database failure'));

    await expect(tasksController.deleteTask(1, 999)).rejects.toThrow();
  });

  it('should return 404 if task is not found during update', async () => {
    jest.spyOn(tasksService, 'updateTask').mockResolvedValue(null);

    await expect(
      tasksController.updateTask(1, 999, { name: 'Non-existent' }),
    ).rejects.toThrow('Not Found');
  });

  it('can find by ID ', async () => {
    const task = await tasksController.getTask(1, 2);
    expect(task).toHaveProperty('name');
  });

  it('can find by ID - 404', async () => {
    jest.spyOn(tasksService, 'getUserTaskById').mockResolvedValue(null);
    await expect(tasksController.getTask(1, 2)).rejects.toThrow('Not Found');
  });
});
