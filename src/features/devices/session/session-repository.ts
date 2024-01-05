import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConnectCreator } from './session-input';
import { Session, sessionDocument } from './session-schema';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: Model<sessionDocument>,
  ) {}

  async countConnection(IP: string, URL: string) {
    const limitDate = new Date(+new Date() - 10000);
    return this.SessionModel.countDocuments({
      IP: IP,
      URL: URL,
      lastActiveDate: { $gt: limitDate },
    });
  }

  async createConnectionInfo(connectInformation: ConnectCreator) {
    await this.SessionModel.create(connectInformation);
  }

  async updateUserId(
    userId: string,
    deviceId: string,
    tokenLastActiveDate: Date,
  ) {
    await this.SessionModel.updateMany(
      { deviceId: deviceId },
      { $set: { userId, lastActiveDate: tokenLastActiveDate } },
    );
  }

  async deleteAllCollection() {
    await this.SessionModel.deleteMany();
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

  async updateConnectDate(deviceId: string) {
    await this.SessionModel.updateOne(
      { deviceId: deviceId },
      { $set: { lastActiveDate: +new Date() } },
    );
  }
}
