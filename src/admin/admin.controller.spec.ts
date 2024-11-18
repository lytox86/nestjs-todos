import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';

describe('AdminController', () => {
  let adminController: AdminController;
  let adminService: Partial<AdminService>;

  beforeEach(async () => {
    const user1 = new User();
    user1.id = 1;
    user1.username = 'testuser1';
    const user2 = new User();
    user2.id = 1;
    user2.username = 'testuser1';
    adminService = {
      getAllUsers: jest.fn().mockResolvedValue([user1, user2]),
      markUserAsDeleted: jest.fn().mockResolvedValue(true),
      changeUserPassword: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminService }],
    }).compile();

    adminController = module.get<AdminController>(AdminController);
  });

  it('should fetch all users', async () => {
    const users = await adminController.getAllUsers();
    expect(users).toHaveLength(2);
    expect(adminService.getAllUsers).toHaveBeenCalled();
  });

  it('can mark user as deleted', async () => {
    await adminController.markUserAsDeleted(1);
    expect(adminService.markUserAsDeleted).toHaveBeenCalledWith(1);
  });

  it("can change user's password", async () => {
    await adminController.changeUserPassword(1, {
      newPassword: 'newPassword123',
    });
    expect(adminService.changeUserPassword).toHaveBeenCalledWith(
      1,
      'newPassword123',
    );
  });

  it('returns not found if user is not found for password change', async () => {
    jest.spyOn(adminService, 'changeUserPassword').mockResolvedValue(false);

    await expect(
      adminController.changeUserPassword(999, {
        newPassword: 'newPassword123',
      }),
    ).rejects.toThrow('Not Found');
  });

  it('passes service-level though: 500 internal server error', async () => {
    jest
      .spyOn(adminService, 'getAllUsers')
      .mockRejectedValue(new Error('Database error'));

    await expect(adminController.getAllUsers()).rejects.toThrow(
      'Database error',
    );
  });
});
