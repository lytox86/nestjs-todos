import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: Partial<Repository<Task>>;

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
    taskRepository = {
      save: jest.fn().mockResolvedValue(task1),
      create: jest.fn().mockResolvedValue(task1),
      findOneBy: jest.fn().mockResolvedValue(task1),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: taskRepository },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  it('should create a new task', async () => {
    const task = await tasksService.createTask(
      { name: 'Task 1', priority: 0, deadline: new Date() },
      1,
    );
    expect(taskRepository.save).toHaveBeenCalledTimes(1);
    expect(taskRepository.create).toHaveBeenCalledTimes(1);
    expect(task).toHaveProperty('name');
  });

  it('can find by ID', async () => {
    const result = await tasksService.getUserTaskById(1, 2);
    expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: 1, userId: 2 });
    expect(result).toEqual(expect.objectContaining({ name: 'task1' }));
  });

  it('should update a task', async () => {
    const result = await tasksService.updateTask(
      1,
      { name: 'Updated Task' },
      1,
    );
    expect(taskRepository.update).toHaveBeenCalledWith(
      { id: 1, userId: 1 },
      { name: 'Updated Task' },
    );
    expect(result).toEqual(expect.objectContaining({ name: 'task1' }));
  });

  it('should delete a task', async () => {
    const deleteMock = jest.fn().mockResolvedValue({ affected: 1 });
    taskRepository.delete = deleteMock;

    const result = await tasksService.deleteTask(1, 1);
    expect(deleteMock).toHaveBeenCalledWith({ id: 1, userId: 1 });
    expect(result).toBe(true);
  });

  it('should not throw an error when updating a non-existent task', async () => {
    taskRepository.update = jest.fn().mockResolvedValue({ affected: 0 });
    const result = await tasksService.updateTask(
      1,
      { name: 'Updated Task' },
      1,
    );
    expect(result).toBe(null);
  });

  it('should not throw an error when deleting a non-existent task', async () => {
    taskRepository.delete = jest.fn().mockResolvedValue({ affected: 0 });
    const result = await tasksService.deleteTask(1, 1);
    expect(result).toBe(false);
  });

  it('should throw an error if database error', async () => {
    jest
      .spyOn(taskRepository, 'save')
      .mockRejectedValue(new Error('Database error'));

    await expect(
      tasksService.createTask(
        { name: 'New Task', priority: 0, deadline: new Date() },
        1,
      ),
    ).rejects.toThrow('Database error');
  });
});
