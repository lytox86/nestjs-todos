import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

describe('AdminService', () => {
  let adminService: AdminService;
  let usersService: Partial<UsersService>;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn().mockResolvedValue([{ id: 1, username: 'testuser' }]),
      findById: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }),
      updateUser: jest.fn().mockResolvedValue(true),
    };
    authService = { hashString: jest.fn().mockResolvedValue('hash') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
  });

  it('should fetch all users', async () => {
    const users = await adminService.getAllUsers(1);
    expect(users).toHaveLength(1);
    expect(users[0]).toHaveProperty('username', 'testuser');
  });

  it('should fetch one user', async () => {
    const user = await adminService.getUserById(1);
    expect(user).toBeDefined();
    expect(user).toHaveProperty('username', 'testuser');
  });

  it('should mark a user as deleted', async () => {
    await adminService.markUserAsDeleted(1);
    expect(usersService.updateUser).toHaveBeenCalledWith(1, {
      isDeleted: true,
    });
  });

  it('should hash passwords before changing them', async () => {
    const newPassword = 'newPassword';

    await adminService.changeUserPassword(1, newPassword);

    expect(usersService.updateUser).toHaveBeenCalledWith(1, {
      hashedPassword: 'hash',
    });
  });
});
