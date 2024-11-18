import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = { hashPassword: jest.fn().mockResolvedValue('hash') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a new user', async () => {
    const saveMock = jest
      .fn()
      .mockResolvedValue({ id: 1, username: 'testuser' });
    userRepository.save = saveMock;
    const createMock = jest
      .fn()
      .mockResolvedValue({ id: 1, username: 'testuser' });
    userRepository.create = createMock;

    const password = 'password123';
    const user = await usersService.createUser('testuser', password);

    expect(user).toEqual({ id: 1, username: 'testuser' });
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(authService.hashPassword).toHaveBeenCalledTimes(1);
  });

  it('should find a user by username', async () => {
    const findOneMock = jest
      .fn()
      .mockResolvedValue({ id: 1, username: 'testuser' });
    userRepository.findOne = findOneMock;

    const user = await usersService.findByUsername('testuser');
    expect(findOneMock).toHaveBeenCalledWith({
      where: { username: 'testuser', isDeleted: false },
    });
    expect(user).toHaveProperty('username', 'testuser');
  });

  it('should rethrow database failures', async () => {
    userRepository.save = jest
      .fn()
      .mockRejectedValue(new Error('Database failure'));
    await expect(
      usersService.createUser('testuser', 'password123'),
    ).rejects.toThrow('Database failure');
  });
});
