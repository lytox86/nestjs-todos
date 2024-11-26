import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';
import { InjectedRequestUser } from '../auth/jwt-payload';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: InjectedRequestUser = request.user; // User was added to the request with role field
    return user && user.role === UserRole.ADMIN;
  }
}
