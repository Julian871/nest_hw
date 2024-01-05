import { Injectable } from '@nestjs/common';
import { SessionRepository } from './session-repository';
import { AuthService } from '../../../security/auth-service';
import { UsersRepository } from '../../users/infrastructure/users-repository';

@Injectable()
export class SessionService {
  constructor(
    private readonly connectRepository: SessionRepository,
    private readonly authService: AuthService,
  ) {}

  async getDeviceList(userId: string) {
    const connectInfo = await this.connectRepository.getDeviceList(userId);
    return connectInfo.map((p) => ({
      ip: p.IP,
      title: p.deviceName,
      lastActiveDate: new Date(p.lastActiveDate),
      deviceId: p.deviceId,
    }));
  }

  async checkDeviceId(deviceId: string, token: string, userId: string | null) {
    const tokenUserId = await this.authService.getUserIdFromRefreshToken(token);

    if (userId === tokenUserId) {
      await this.connectRepository.deleteByDeviceId(deviceId);
      return true;
    } else {
      return false;
    }
  }

  async deleteUserSession(userId: string, token: string) {
    const deviceId = await this.authService.getDeviceIdRefreshToken(token);
    await this.connectRepository.deleteUserSession(userId, deviceId);
  }

  async activeDate(token: string) {
    const tokenLastActiveDate =
      await this.authService.getLastActiveDateRefreshToken(token);
    const deviceId = await this.authService.getDeviceIdRefreshToken(token);
    return this.connectRepository.getSession(deviceId, tokenLastActiveDate);
  }
}
