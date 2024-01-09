import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConnectCreator } from './session-input';
import { Session, sessionDocument } from './session-schema';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: Model<sessionDocument>,
    private dataSource: DataSource,
  ) {}

  async createConnectionInfo(connectInfo: ConnectCreator) {
    await this.dataSource.query(`
INSERT INTO public."Session"("IP", "lastActiveDate", "deviceName", "deviceId", "userId")

VALUES ('${connectInfo.IP}', '${connectInfo.lastActiveDate}', '${connectInfo.deviceName}',
'${connectInfo.deviceId}', '${connectInfo.userId}');`);
  }

  async updateUserId(
    userId: string,
    deviceId: string,
    tokenLastActiveDate: Date,
  ) {
    await this.dataSource.query(`
UPDATE public."Session"

SET "lastActiveDate"='${tokenLastActiveDate.toISOString()}', "userId"='${userId}'

WHERE "deviceId" = '${deviceId}';`);
  }

  async getDeviceList(userId: string) {
    return this.SessionModel.find({ userId: userId }).lean();
  }

  async findSession(deviceId: string) {
    return this.SessionModel.findOne({ deviceId });
  }

  async getSession(deviceId: string, lastActiveDate: Date) {
    return this.SessionModel.findOne({ deviceId, lastActiveDate });
  }

  async deleteByDeviceId(deviceId: string) {
    await this.SessionModel.deleteMany({ deviceId });
  }

  async deleteCurrentSession(deviceId: string, lastActiveDate: Date) {
    await this.SessionModel.deleteOne({ deviceId, lastActiveDate });
  }

  async deleteUserSession(userId: string | null, deviceId: string) {
    await this.SessionModel.deleteMany({
      userId: userId,
      deviceId: { $not: { $regex: deviceId } },
    });
  }

  async updateConnectDate(deviceId: string, lastActiveDate: Date) {
    await this.SessionModel.updateOne(
      { deviceId: deviceId },
      { $set: { lastActiveDate } },
    );
  }
}
