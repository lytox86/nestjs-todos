import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { PopulateDbService } from './populate-db';
import { User } from '../entities/user.entity';
import { LoginService } from './login.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: Partial<UsersService>;
  let authService: Partial<AuthService>;
  let loginService: Partial<LoginService>;

  beforeEach(async () => {
    const user1 = new User();
    user1.id = 1;
    user1.username = 'testuser1';
    const user2 = new User();
    user2.id = 1;
    user2.username = 'testuser1';
    usersService = {
      findByUsername: jest.fn().mockResolvedValue(user1),
      createUser: jest.fn().mockResolvedValue(user1),
      findById: jest.fn().mockResolvedValue(user1),
      updateUser: jest.fn().mockResolvedValue(true),
      unsetToken: jest.fn().mockResolvedValue(true),
    };

    authService = {
      verifyHash: jest.fn().mockResolvedValue(true),
      hashString: jest.fn().mockResolvedValue('hash'),
    };

    loginService = {
      login: jest.fn().mockResolvedValue({
        tokens: { accessToken: 'accessToken', refreshToken: 'refreshToken' },
        user: user1,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UsersController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: LoginService, useValue: loginService },
        { provide: PopulateDbService, useValue: {} },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should be able to login', async () => {
    const token = await usersController.login({
      username: 'username',
      password: 'password',
    });
    expect(token.access_token).toEqual('accessToken');
    expect(loginService.login).toHaveBeenCalledWith({
      username: 'username',
      password: 'password',
    });
  });

  it('should be able to register', async () => {
    jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);

    const user = await usersController.register({
      username: 'username',
      password: 'password',
      email: 'email',
    });
    expect(usersService.findByUsername).toHaveBeenCalledWith('username');
    expect(user).toEqual({ id: 1, username: 'testuser1' });
  });

  it('should not be able to register if username taken', async () => {
    await expect(
      usersController.register({
        username: 'u',
        password: 'p',
        email: 'e',
      }),
    ).rejects.toThrow('Username taken');
  });

  it('should be able to change password', async () => {
    await usersController.changePassword(
      {
        oldPassword: 'username',
        newPassword: 'newPassword',
      },
      1,
    );
    expect(authService.verifyHash).toHaveBeenCalled();
    expect(authService.hashString).toHaveBeenCalled();
  });

  it('should be able to see current user', async () => {
    const myself = await usersController.showMe(1);
    expect(myself).toEqual({ id: 1, username: 'testuser1' });
    expect(usersService.findById).toHaveBeenCalled();
  });

  // TODO Login Service test
  // it('should return unauthorized if user is not found', async () => {
  //   jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);
  //
  //   await expect(
  //     usersController.login({
  //       username: 'testuser',
  //       password: 'password123',
  //     }),
  //   ).rejects.toThrow('Invalid username or password');
  // });

  // it('should return unauthorized if password invalid', async () => {
  //   jest.spyOn(authService, 'verifyHash').mockResolvedValue(false);
  //
  //   await expect(
  //     usersController.login({
  //       username: 'testuser',
  //       password: 'password123',
  //     }),
  //   ).rejects.toThrow('Invalid username or password');
  // });

  it('should throw an error if service layer throws', async () => {
    jest
      .spyOn(loginService, 'login')
      .mockRejectedValue(new Error('Database failure'));
    await expect(
      usersController.login({ username: 'u', password: 'p' }),
    ).rejects.toThrow();
  });

  it('should be able to see current user: 404', async () => {
    jest.spyOn(usersService, 'findById').mockResolvedValue(null);
    await expect(usersController.showMe(1)).rejects.toThrow('Not Found');
  });

  it('should be able to change password - 404', async () => {
    jest.spyOn(usersService, 'findById').mockResolvedValue(null);
    await expect(
      usersController.changePassword(
        {
          oldPassword: 'username',
          newPassword: 'newPassword',
        },
        1,
      ),
    ).rejects.toThrow('Not Found');
  });

  it('should be able to change password - 401', async () => {
    jest.spyOn(authService, 'verifyHash').mockResolvedValue(false);
    await expect(
      usersController.changePassword(
        {
          oldPassword: 'username',
          newPassword: 'newPassword',
        },
        1,
      ),
    ).rejects.toThrow('Old password invalid');
  });
});
