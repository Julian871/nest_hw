import { v4 as uuidv4 } from 'uuid';

export class ConnectCreator {
  IP: string;
  URL: string;
  lastActiveDate: Date;
  deviceName: string;
  deviceId: string;
  userId: string | null;

  constructor(
    IP: string,
    URL: string,
    deviceName: string,
    userId: string | null,
    deviceId: string | null,
  ) {
    this.IP = IP;
    this.URL = URL;
    this.lastActiveDate = new Date();
    this.deviceName = deviceName;
    this.deviceId = deviceId ?? uuidv4();
    this.userId = userId;
  }
}
