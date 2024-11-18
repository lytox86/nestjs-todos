import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { Logger } from '@nestjs/common';
import { Task } from '../entities/task.entity';

// TODO this service should not go into production
@Injectable()
export class PopulateDbService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}
  private readonly logger = new Logger(PopulateDbService.name);

  async populateDb() {
    this.logger.log('PopulateDbService');
    const adminUser = new User();
    adminUser.username = 'admin';
    adminUser.hashedPassword = await this.authService.hashPassword('admin');
    adminUser.role = UserRole.ADMIN;
    await this.userRepository.save(adminUser);

    // testing users
    for (let i = 0; i < 10; i++) {
      const user = new User();
      user.username = `testuser${i}`;
      user.hashedPassword = await this.authService.hashPassword(`testuser${i}`);
      //user.role = UserRole.USER;
      const savedUser = await this.userRepository.save(user);
      //const taskAmoumt = i === 1 ? 100 : 10;
      for (let j = 0; j < 10; j++) {
        const task = new Task();
        task.name = `task-${j}-user-${i}`;
        task.priority = j;
        task.deadline = new Date();
        task.created = new Date();
        task.completed = j % 2 === 0;
        task.userId = savedUser.id;
        await this.taskRepository.save(task);
      }
    }

    // const tasks = await this.taskRepository.find();
    // this.logger.debug(tasks);
  }
}
