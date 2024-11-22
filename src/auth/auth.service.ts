import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { MyJwtPayload } from './jwt-payload';

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
    const payload: MyJwtPayload = {
      sub: user.id.toString(),
      username: user.username,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '5m',
    });
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id.toString(),
      },
      {
        expiresIn: '1h',
      },
    );

    return { accessToken, refreshToken };
  }

  verifyHash(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashString(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
