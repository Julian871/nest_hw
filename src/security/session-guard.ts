import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth-service';
import { Request } from 'express';
import { Session } from '../entities/session-entity';
import { SessionRepo } from '../features/devices/infrastructure/session-repo';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionRepo: SessionRepo,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    let userId: number | null = null;
    let deviceId: string | null = null;
    let tokenLastActiveDate: string | any;

    if (req.cookies.refreshToken) {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
      deviceId = await this.authService.getDeviceIdRefreshToken(
        req.cookies.refreshToken,
      );
      tokenLastActiveDate =
        await this.authService.getLastActiveDateRefreshToken(
          req.cookies.refreshToken,
        );
    }

    if (!req.cookies.refreshToken) {
      tokenLastActiveDate = new Date().toISOString();
    }

    if (req.headers.authorization) {
      const userIdFromAccess = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization,
      );
      if (userIdFromAccess !== null) userId = userIdFromAccess;
    }

    const IP = req.ip ?? '';
    const deviceName = req.headers['user-agent'] || 'hacker';

    const connection = new Session();
    connection.IP = IP;
    connection.deviceName = deviceName;
    connection.userId = userId;
    connection.deviceId = deviceId ?? uuidv4();
    connection.lastActiveDate = tokenLastActiveDate;

    await this.sessionRepo.saveSession(connection);
    req.connect = {
      userId,
      deviceId: connection.deviceId,
      tokenLastActiveDate,
    };
    return true;
  }
}
