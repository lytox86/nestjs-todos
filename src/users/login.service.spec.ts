import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { LoginService } from './login.service';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';

describe('LoginService', () => {
  let loginService: LoginService;
  let authService: Partial<AuthService>;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    const user1 = new User();
    user1.id = 1;
    user1.username = 'testuser1';
    authService = {
      verifyHash: jest.fn().mockResolvedValue(true),
      login: jest.fn().mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      }),
    };
    usersService = {
      findByUsername: jest.fn().mockResolvedValue(user1),
    };
    jwtService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        { provide: AuthService, useValue: authService },
        { provide: JwtService, useValue: jwtService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    loginService = module.get<LoginService>(LoginService);
  });

  it('should be able to login', async () => {
    const { tokens } = await loginService.login({
      username: 'username',
      password: 'password',
    });
    expect(tokens.accessToken).toEqual('accessToken');
    expect(usersService.findByUsername).toHaveBeenCalledWith('username');
  });

  it('should return unauthorized if user is not found', async () => {
    jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);

    await expect(
      loginService.login({
        username: 'testuser',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid username or password');
  });

  it('should return unauthorized if password invalid', async () => {
    jest.spyOn(authService, 'verifyHash').mockResolvedValue(false);

    await expect(
      loginService.login({
        username: 'testuser',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid username or password');
  });
});
