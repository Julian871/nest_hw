import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../features/devices/application/session-service';

@Injectable()
export class CheckSessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    if (!req.cookies.refreshToken) {
      throw new UnauthorizedException('no token');
    }
    const checkLastActiveDate = await this.sessionService.activeDate(
      req.cookies.refreshToken,
    );
    if (!checkLastActiveDate) {
      throw new UnauthorizedException(`active date`);
    }
    return true;
  }
}
