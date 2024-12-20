import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET_KEY } from '../constants';
import { AuthService } from './auth.service';
import { InjectedRequestUser, MyJwtPayload } from './jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET_KEY,
    });
  }
  private readonly logger = new Logger(JwtStrategy.name);

  validate(payload: MyJwtPayload): InjectedRequestUser {
    return {
      userId: Number(payload.sub),
      username: payload.username,
      role: payload.role,
    };
    //await this.authService.validateAndGetUser(username, password);
  }
}
