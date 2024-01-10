import { v4 as uuidv4 } from 'uuid';

export class ConnectCreator {
  IP: string;
  lastActiveDate: string;
  deviceName: string;
  deviceId: string;
  userId: string | null;

  constructor(
    IP: string,
    deviceName: string,
    userId: string | null,
    deviceId: string | null,
    tokenLastActiveDate: string,
  ) {
    this.IP = IP;
    this.lastActiveDate = tokenLastActiveDate;
    this.deviceName = deviceName;
    this.deviceId = deviceId ?? uuidv4();
    this.userId = userId;
  }
}
