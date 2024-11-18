import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // async validateAndGetUser(username: string, password: string) {
  //   const user = await this.findUserByUsername(username);
  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }
  //   if (!(await bcrypt.compare(password, user.hashedPassword))) {
  //     throw new UnauthorizedException();
  //   }
  //   return user;
  // }

  // private findUserByUsername(username: string) {
  //   return this.userRepository.findOne({ where: { username } });
  // }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id.toString(),
      username: user.username,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
