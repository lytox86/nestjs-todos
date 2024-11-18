import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module'; // Import the main AppModule
import { UsersService } from '../src/users/users.service';
import { FastifyAdapter } from '@nestjs/platform-fastify';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    usersService = moduleFixture.get<UsersService>(UsersService);

    await usersService.createUser('johndoe', 'password123');

    // Get the JWT token after creating a user to use in subsequent tests
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        username: 'johndoe',
        password: 'password123',
      });

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login and return an access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: 'johndoe', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
  });

  it('should return an error for incorrect login credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: 'wronguser', password: 'wrongpassword' });

    expect(response.status).toBe(401); // Unauthorized
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('should change password', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'password123',
        newPassword: 'newpassword456',
      });

    expect(response.status).toBe(204);
  });

  it('should return an error if old password is incorrect', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'wrongoldpassword',
        newPassword: 'newpassword456',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Old password invalid');
  });

  afterAll(async () => {
    await app.close();
  });
});
