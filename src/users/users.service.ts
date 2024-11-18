import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { PAGE_SIZE } from '../constants';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}
  private readonly logger = new Logger(UsersService.name);

  async findByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username, isDeleted: false },
    });
  }

  async createUser(username: string, password: string) {
    const hashedPassword = await this.authService.hashPassword(password);
    const user = this.userRepository.create({ username, hashedPassword });
    return this.userRepository.save(user);
  }

  findAll(page: number) {
    return this.userRepository.find({
      skip: PAGE_SIZE * (page - 1),
      take: PAGE_SIZE,
      where: { isDeleted: false },
    });
  }

  findById(id: number) {
    return this.userRepository.findOneBy({ id, isDeleted: false });
  }

  /**
   * @return true if user was updated
   */
  async updateUser(id: number, updates: Partial<User>): Promise<boolean> {
    const updateResult = await this.userRepository.update(id, updates);
    return updateResult.affected === 1;
  }

  /**
   * @return true if user was updated
   */
  async updatePassword(userId: number, newHash: string): Promise<boolean> {
    const updateResult = await this.userRepository.update(userId, {
      hashedPassword: newHash,
    });
    return updateResult.affected === 1;
  }
}
