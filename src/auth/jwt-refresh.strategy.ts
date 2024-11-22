import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_REFRESH_SECRET_KEY } from '../constants';
import { AuthService } from './auth.service';
import { MyJwtPayload } from './jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_REFRESH_SECRET_KEY,
    });
  }
  private readonly logger = new Logger(JwtStrategy.name);

  validate(payload: MyJwtPayload) {
    return {
      attributes: payload.sub,
      refreshTokenExpiresAt: new Date(payload.exp * 1000),
    };
  }
}
