import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { AuthService } from './auth-service';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.headers.authorization !== process.env.BASIC_PASSWORD) {
      throw new UnauthorizedException();
    } else return true;
  }
}

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }

    const token = request.headers.authorization;
    const userId = await this.authService.getUserIdFromAccessToken(token);
    if (userId) {
      return true; //req.user = {userId}
    }
    throw new UnauthorizedException();
  }
}
