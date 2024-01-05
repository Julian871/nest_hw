import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth-service';
import { Request } from 'express';
import { SessionRepository } from '../features/devices/session/session-repository';
import { ConnectCreator } from '../features/devices/session/session-input';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly connectRepository: SessionRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    let userId: string | null = null;
    let deviceId: string | null = null;
    let tokenLastActiveDate: Date | any;

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
      tokenLastActiveDate = new Date();
    }

    if (req.headers.authorization) {
      const userIdFromAccess = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization,
      );
      if (userIdFromAccess !== null) userId = userIdFromAccess;
    }

    const IP = req.ip ?? '';
    const deviceName = req.headers['user-agent'] || 'hacker';
    const newConnection = new ConnectCreator(
      IP,
      deviceName,
      userId,
      deviceId,
      tokenLastActiveDate,
    );
    await this.connectRepository.createConnectionInfo(newConnection);
    req.connect = {
      userId,
      deviceId: newConnection.deviceId,
      tokenLastActiveDate,
    };
    return true;
  }
}
