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
    return result.map((p) => ({
      ip: p.IP,
      title: p.deviceName,
      lastActiveDate: new Date(p.lastActiveDate),
      deviceId: p.deviceId,
    }));
  }

  async deleteSessionById(deviceId: string, token: string, userId: number) {
    const tokenUserId = await this.authService.getUserIdFromRefreshToken(token);
    if (userId !== tokenUserId.toString()) throw new ForbiddenException();

    await this.sessionRepo.deleteSessionByDeviceId(deviceId);
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
