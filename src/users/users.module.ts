import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { PopulateDbService } from './populate-db';
import { Task } from '../entities/task.entity';
import { LoginService } from './login.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Task]), // TODO move DB populator to own module
    AuthModule,
  ],
  providers: [UsersService, LoginService, PopulateDbService],
  exports: [UsersService, PopulateDbService],
  controllers: [UsersController],
})
export class UsersModule {}
