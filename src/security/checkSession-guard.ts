import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../features/devices/session/session-service';

@Injectable()
export class CheckSessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    if (!req.cookies.refreshToken) {
      throw new UnauthorizedException();
    }
    const checkLastActiveDate = await this.sessionService.activeDate(
      req.cookies.refreshToken,
    );
    if (!checkLastActiveDate) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
