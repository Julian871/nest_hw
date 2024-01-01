import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth-service';
import { Request } from 'express';
import { ConnectRepository } from '../features/connect/connect-repository';
import { ConnectCreator } from '../features/connect/connect-input';

@Injectable()
export class ConnectGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly connectRepository: ConnectRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    let userId: string | null = null;
    let deviceId: string | null = null;
    if (req.cookies && req.cookies.refreshToken) {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
      deviceId = await this.authService.getDeviceIdRefreshToken(
        req.cookies.refreshToken,
      );
    }
    if (req.headers.authorization) {
      userId = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization,
      );
    }

    const IP = req.ip ?? '';
    const URL = req.method + req.originalUrl;
    const deviceName = req.headers['user-agent'] || 'hacker';
    const newConnection = new ConnectCreator(
      IP,
      URL,
      deviceName,
      userId,
      deviceId,
    );
    await this.connectRepository.createConnectionInfo(newConnection);
    req.connect = { userId, deviceId: newConnection.deviceId };
    return true;
  }
}
