import { Injectable } from '@nestjs/common';
import { ConnectCreator } from '../application/session-input';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionRepository {
  constructor(private dataSource: DataSource) {}

  async createConnectionInfo(connectInfo: ConnectCreator) {
    await this.dataSource.query(
      `
    INSERT INTO public."Session"("IP", "lastActiveDate", "deviceName", "deviceId", "userId")
    VALUES ($1, $2, $3, $4, $5)`,
      [
        connectInfo.IP,
        connectInfo.lastActiveDate,
        connectInfo.deviceName,
        connectInfo.deviceId,
        connectInfo.userId,
      ],
    );
  }

  async updateUserId(
    userId: number,
    deviceId: string,
    tokenLastActiveDate: string,
  ) {
    await this.dataSource.query(
      `
    UPDATE public."Session"
    SET "lastActiveDate" = $3, "userId" = $1
    WHERE "deviceId" = $2`,
      [userId, deviceId, tokenLastActiveDate],
    );
  }

  async getDeviceList(userId: string) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM public."Session"
    WHERE "userId" = $1`,
      [userId],
    );

    return result.map((e) => {
      return {
        ip: e.IP,
        title: e.deviceName,
        lastActiveDate: new Date(e.lastActiveDate),
        deviceId: e.deviceId,
      };
    });
  }

  async findSession(deviceId: string) {
    return this.dataSource.query(
      `
    SELECT *
    FROM public."Session"
    WHERE "deviceId" = $1`,
      [deviceId],
    );
  }

  async getSession(deviceId: string, lastActiveDate: string) {
    return this.dataSource.query(
      `
    SELECT *
    FROM public."Session"
    WHERE "deviceId" = $1 and "lastActiveDate" = $2`,
      [deviceId, lastActiveDate],
    );
  }

  async deleteByDeviceId(deviceId: string) {
    await this.dataSource.query(
      `
    DELETE FROM public."Session"
    WHERE "deviceId" = $1`,
      [deviceId],
    );
  }

  async deleteCurrentSession(deviceId: string, lastActiveDate: string) {
    await this.dataSource.query(
      `
    DELETE FROM public."Session"
    WHERE "deviceId" = $1 and "lastActiveDate" = $2`,
      [deviceId, lastActiveDate],
    );
  }

  async deleteUserSession(userId: string | null, deviceId: string) {
    await this.dataSource.query(
      `
    DELETE FROM public."Session"
    WHERE "userId" = $1 and "deviceId" != $2`,
      [userId, deviceId],
    );
  }

  async updateConnectDate(deviceId: string, lastActiveDate: string) {
    await this.dataSource.query(
      `
    UPDATE public."Session"
    SET "lastActiveDate" = $2
    WHERE "deviceId" = $1`,
      [deviceId, lastActiveDate],
    );
  }
}
