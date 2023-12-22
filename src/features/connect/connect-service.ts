import { Injectable } from '@nestjs/common';
import { ConnectRepository } from './connect-repository';
import { ConnectCreator } from './connect-input';

@Injectable()
export class ConnectService {
  constructor(private readonly connectRepository: ConnectRepository) {}
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
      const newConnection = new ConnectCreator(IP, URL, deviceName, userId);
      await this.connectRepository.createConnectionInfo(newConnection);
      return false;
    } else {
      const newConnection = new ConnectCreator(IP, URL, deviceName, userId);
      await this.connectRepository.createConnectionInfo(newConnection);
      return newConnection;
    }
  }
}
