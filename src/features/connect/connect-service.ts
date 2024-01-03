import { Injectable } from '@nestjs/common';
import { ConnectRepository } from './connect-repository';
import { ConnectCreator } from './connect-input';
import { AuthService } from '../../security/auth-service';
import { UsersRepository } from '../users/infrastructure/users-repository';

@Injectable()
export class ConnectService {
  constructor(
    private readonly connectRepository: ConnectRepository,
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}
  async createConnectData(
    IP: string,
    URL: string,
    deviceName: string,
    userId: string | null,
  ) {
    const countConnection = await this.connectRepository.countConnection(
      IP,
      URL,
    );
    if (countConnection >= 5) {
      const newConnection = new ConnectCreator(
        IP,
        URL,
        deviceName,
        userId,
        null,
      );
      await this.connectRepository.createConnectionInfo(newConnection);
      return false;
    } else {
      const newConnection = new ConnectCreator(
        IP,
        URL,
        deviceName,
        userId,
        null,
      );
      await this.connectRepository.createConnectionInfo(newConnection);
      return newConnection;
    }
  }

  async getDeviceList(userId: string) {
    const connectInfo = await this.connectRepository.getDeviceList(userId);
    return connectInfo.map((p) => ({
      ip: p.IP,
      title: p.deviceName + '/' + p.URL,
      lastActiveDate: new Date(p.lastActiveDate),
      deviceId: p.deviceId,
    }));
  }

  async checkDeviceId(deviceId: string, token: string) {
    const connection = await this.connectRepository.findDeviceId(deviceId);
    if (!connection) {
      return null;
    }
    const tokenUserId = await this.authService.getUserIdFromRefreshToken(token);

    if (connection.userId === tokenUserId) {
      await this.connectRepository.deleteByDeviceId(deviceId);
      await this.usersRepository.updateBlackList(token);
      return true;
    } else {
      return false;
    }
  }

  async deleteUserSession(token: string) {
    const userId = await this.authService.getUserIdFromRefreshToken(token);
    const deviceId = await this.authService.getDeviceIdRefreshToken(token);
    await this.usersRepository.updateBlackList(token);
    await this.connectRepository.deleteUserSession(userId, deviceId);
  }
}
