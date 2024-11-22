import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JWT_SECRET_KEY } from '../constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), //TODO shared module?
    JwtModule.register({
      global: true,
      secret: JWT_SECRET_KEY,
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
