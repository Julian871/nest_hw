import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from '../../../security/auth-service';
import { SessionRepo } from '../infrastructure/session-repo';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepo,
    private readonly authService: AuthService,
  ) {}

  async getDeviceList(userId: number) {
    const result = await this.sessionRepo.getSessionByUserId(userId);

    return result.map((e) => {
      return {
        ip: e.IP,
        title: e.deviceName,
        lastActiveDate: new Date(e.lastActiveDate),
        deviceId: e.deviceId,
      };
    });
  }

  async checkDeviceId(deviceId: string, token: string, userId: number | null) {
    const tokenUserId = await this.authService.getUserIdFromRefreshToken(token);
    if (userId !== tokenUserId) throw new ForbiddenException();

    await this.sessionRepo.getSessionByDeviceId(deviceId);
    return;
  }

  async deleteUserSession(userId: number, token: string) {
    const deviceId = await this.authService.getDeviceIdRefreshToken(token);
    await this.sessionRepo.deleteSessionByDeviceIdAndUserId(deviceId, userId);
  }

  async activeDate(token: string) {
    const tokenLastActiveDate =
      await this.authService.getLastActiveDateRefreshToken(token);
    const deviceId = await this.authService.getDeviceIdRefreshToken(token);
    return this.sessionRepo.getSessionByDeviceIdAndDate(
      deviceId,
      tokenLastActiveDate,
    );
  }
}
