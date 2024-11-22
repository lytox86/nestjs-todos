import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  getAllUsers(page: number): Promise<User[]> {
    return this.usersService.findAll(page);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.usersService.findById(id);
  }

  /**
   * @return true if user was updated
   */
  markUserAsDeleted(userId: number): Promise<boolean> {
    return this.usersService.updateUser(userId, { isDeleted: true });
  }

  /**
   * @return true if user was updated
   */
  async changeUserPassword(
    userId: number,
    newPassword: string,
  ): Promise<boolean> {
    const hashedPassword = await this.authService.hashString(newPassword);
    return this.usersService.updateUser(userId, { hashedPassword });
  }
}
