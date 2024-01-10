import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../infrastructure/session-repository';
import { AuthService } from '../../../security/auth-service';
import { UsersRepository } from '../../users/infrastructure/users-repository';

@Injectable()
export class SessionService {
  constructor(
    private readonly connectRepository: SessionRepository,
    private readonly authService: AuthService,
  ) {}

  async getDeviceList(userId: string) {
    return this.connectRepository.getDeviceList(userId);
  }

  async checkDeviceId(deviceId: string, token: string, userId: string | null) {
    const tokenUserId = await this.authService.getUserIdFromRefreshToken(token);
    if (userId == tokenUserId.toString()) {
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
