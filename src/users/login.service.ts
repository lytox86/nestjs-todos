import { UnauthorizedException, Logger, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { LoginDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';
import { MyJwtPayload } from '../auth/jwt-payload';

@Injectable()
export class LoginService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(LoginService.name);

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto; // TODO no HTTP exceptions here
    const user = await this.usersService.findByUsername(username);
    if (user === null || user.isDeleted) {
      this.logger.debug(
        `no user found ${username}, ${JSON.stringify(loginDto)}`,
      );
      throw new UnauthorizedException('Invalid username or password');
    }

    // Check password validity
    const isPasswordValid = await this.authService.verifyHash(
      password,
      user.hashedPassword,
    );
    if (!isPasswordValid) {
      this.logger.debug('wrong password');
      throw new UnauthorizedException('Invalid username or password');
    }

    // Issue JWT token
    const tokens = await this.authService.login(user);
    return { tokens, user };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.hashedRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const isValid = await this.authService.verifyHash(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: MyJwtPayload = {
      sub: user.id.toString(),
      username: user.username,
      role: user.role,
    };
    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '5m',
    });

    return { accessToken: newAccessToken };
  }
}
