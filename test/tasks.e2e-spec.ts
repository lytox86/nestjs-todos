import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersService } from '../src/users/users.service';
import { TasksService } from '../src/tasks/tasks.service';
import { FastifyAdapter } from '@nestjs/platform-fastify';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let usersService: UsersService;
  let tasksService: TasksService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    usersService = moduleFixture.get<UsersService>(UsersService);
    tasksService = moduleFixture.get<TasksService>(TasksService);

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    await usersService.createUser('johndoe', 'password123');
    await tasksService.createTask(
      { name: 'Task', priority: 2, deadline: new Date() },
      1,
    );
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: 'johndoe', password: 'password123' });

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('can create a new task', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Task',
        priority: 1,
        deadline: '2024-12-31T17:27:54.347Z',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Task');
  });

  it('should fetch all tasks for the logged-in user', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('cannot fetch tasks without login', async () => {
    const response = await request(app.getHttpServer()).get('/tasks');

    expect(response.status).toBe(401);
  });

  it('can fetch single task', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Task',
        priority: 2,
        deadline: '2024-12-31T17:27:54.347Z',
      });

    const taskId = createResponse.body.id;

    const fetchResponse = await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(fetchResponse.status).toBe(200);
    expect(fetchResponse.body.name).toBe('Task');
  });

  it('returns error if task does not exist', async () => {
    const fetchResponse = await request(app.getHttpServer())
      .get(`/tasks/999`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(fetchResponse.status).toBe(404);
  });

  it('should update an existing task', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Task to Update',
        priority: 2,
        deadline: '2024-12-31T17:27:54.347Z',
      });

    const taskId = createResponse.body.id;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Task',
        priority: 1,
        completed: true,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Updated Task');
    expect(updateResponse.body.isCompleted).toBe(true);
    expect(updateResponse.body.priority).toBe(1);
  });

  it('should delete a task', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Task to Delete',
        priority: 2,
      });

    const taskId = createResponse.body.id;

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteResponse.status).toBe(202);
  });

  afterAll(async () => {
    await app.close();
  });
});
